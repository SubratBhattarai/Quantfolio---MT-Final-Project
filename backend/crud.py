import re
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from . import models, schemas
from .market_service import market_service
from .quant_metrics import calculate_portfolio_risk_and_performance

def resolve_price_and_meta(ticker: str, current_price: Optional[float] = None, name: Optional[str] = None, asset_class: Optional[str] = None):
    ticker_upper = ticker.strip().upper()
    quote = market_service.get_normalized_quote(ticker_upper)
    
    final_price = current_price if (current_price is not None and current_price > 0) else quote.get("price", 100.0)
    final_name = name if (name and name.strip()) else quote.get("name", f"{ticker_upper} Holding")
    final_class = asset_class if (asset_class and asset_class.strip()) else quote.get("asset_class", "Equities")
    currency = quote.get("currency", "USD")
    return ticker_upper, final_price, final_name, final_class, currency

def resolve_holding_latest_price(h: models.Holding) -> float:
    """
    Resolves latest available market price with comprehensive missing-price safe fallback handling:
    1. Normalized quote from market_service
    2. Holding current_price
    3. Holding buy_price (cost basis proxy)
    4. Safe baseline fallback (100.0) if all prices are missing or zero
    """
    quote = market_service.get_normalized_quote(h.ticker)
    if quote and quote.get("price") is not None and float(quote.get("price")) > 0:
        return float(quote["price"])
    if h.current_price is not None and float(h.current_price) > 0:
        return float(h.current_price)
    if h.buy_price is not None and float(h.buy_price) > 0:
        return float(h.buy_price)
    return 100.0

def enrich_holding_dict(h: models.Holding, total_portfolio_value: float) -> schemas.HoldingResponse:
    # Query latest normalized quote for fresh price, day change, and last-updated time
    quote = market_service.get_normalized_quote(h.ticker)
    active_price = resolve_holding_latest_price(h)
    currency = getattr(h, "currency", None) or quote.get("currency", "USD")
    
    market_val = round(h.quantity * active_price, 2)
    buy_price = h.buy_price if (h.buy_price is not None and h.buy_price >= 0) else active_price
    cost = round(h.quantity * buy_price, 2)
    pnl = round(market_val - cost, 2)
    pnl_pct = round((pnl / cost * 100), 2) if cost > 0 else 0.0
    weight = round((market_val / total_portfolio_value * 100), 2) if total_portfolio_value > 0 else 0.0

    last_updated_dt = getattr(h, "last_updated", None) or h.updated_at or h.created_at or datetime.utcnow()
    formatted_time = last_updated_dt.strftime("%b %d, %I:%M %p")

    return schemas.HoldingResponse(
        id=h.id,
        portfolio_id=h.portfolio_id,
        ticker=h.ticker,
        name=h.name or quote.get("name", f"{h.ticker} Holding"),
        asset_class=h.asset_class or quote.get("asset_class", "Equities"),
        quantity=h.quantity,
        buy_price=buy_price,
        current_price=active_price,
        available_price=active_price,
        currency=currency,
        last_updated=last_updated_dt,
        formatted_last_updated=formatted_time,
        day_change=round(float(quote.get("day_change", 0.0)), 2),
        day_change_percent=round(float(quote.get("day_change_percent", 0.0)), 2),
        notes=h.notes,
        created_at=h.created_at,
        updated_at=h.updated_at,
        market_value=market_val,
        cost_basis=cost,
        unrealized_pnl=pnl,
        unrealized_pnl_percent=pnl_pct,
        weight_percent=weight
    )

def calculate_portfolio_metrics(p: models.Portfolio):
    holdings = p.holdings or []
    total_market_value = 0.0
    total_cost = 0.0

    for h in holdings:
        latest_price = resolve_holding_latest_price(h)
        mv = h.quantity * latest_price
        c = h.quantity * (h.buy_price if (h.buy_price is not None and h.buy_price >= 0) else latest_price)
        total_market_value += mv
        total_cost += c

    total_portfolio_value = total_market_value + (p.cash_balance or 0.0)
    total_unrealized_pnl = total_market_value - total_cost
    total_unrealized_pnl_pct = (total_unrealized_pnl / total_cost * 100) if total_cost > 0 else 0.0

    top_holdings = [h.ticker for h in sorted(holdings, key=lambda x: x.quantity * resolve_holding_latest_price(x), reverse=True)[:4]]

    return {
        "total_market_value": round(total_market_value, 2),
        "total_portfolio_value": round(total_portfolio_value, 2),
        "total_cost": round(total_cost, 2),
        "total_unrealized_pnl": round(total_unrealized_pnl, 2),
        "total_unrealized_pnl_percent": round(total_unrealized_pnl_pct, 2),
        "holdings_count": len(holdings),
        "top_holdings": top_holdings
    }

def get_portfolios(db: Session) -> List[schemas.PortfolioSummary]:
    portfolios = db.query(models.Portfolio).order_by(models.Portfolio.id.desc()).all()
    results = []
    for p in portfolios:
        metrics = calculate_portfolio_metrics(p)
        results.append(schemas.PortfolioSummary(
            id=p.id,
            name=p.name,
            description=p.description,
            benchmark=p.benchmark,
            cash_balance=p.cash_balance,
            currency="USD",
            created_at=p.created_at,
            updated_at=p.updated_at,
            **metrics
        ))
    return results

def get_portfolio(db: Session, portfolio_id: int) -> Optional[schemas.PortfolioDetail]:
    p = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not p:
        return None

    metrics = calculate_portfolio_metrics(p)
    total_port_val = metrics["total_portfolio_value"]

    enriched_holdings = [enrich_holding_dict(h, total_port_val) for h in p.holdings]
    enriched_holdings.sort(key=lambda x: x.market_value, reverse=True)

    allocation = {}
    for h in enriched_holdings:
        ac = h.asset_class or "Equities"
        allocation[ac] = round(allocation.get(ac, 0.0) + h.weight_percent, 2)
    if total_port_val > 0:
        allocation["Cash"] = round(((p.cash_balance or 0.0) / total_port_val * 100), 2)

    # Compute selected quantitative performance and risk metrics safely
    risk_metrics = calculate_portfolio_risk_and_performance(
        portfolio=p,
        holdings=p.holdings or [],
        total_market_value=metrics["total_market_value"],
        total_cost=metrics["total_cost"],
        cash_balance=p.cash_balance or 0.0
    )

    last_sync = p.updated_at or p.created_at or datetime.utcnow()

    return schemas.PortfolioDetail(
        id=p.id,
        name=p.name,
        description=p.description,
        benchmark=p.benchmark,
        cash_balance=p.cash_balance,
        currency="USD",
        created_at=p.created_at,
        updated_at=p.updated_at,
        formatted_last_updated=last_sync.strftime("%b %d, %Y at %I:%M %p"),
        holdings=enriched_holdings,
        asset_allocation=allocation,
        risk_metrics=risk_metrics,
        market_data_attribution=market_service.get_attribution(),
        **metrics
    )

def create_portfolio(db: Session, portfolio_in: schemas.PortfolioCreate) -> models.Portfolio:
    clean_name = (portfolio_in.name or "").strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Portfolio name cannot be blank or empty.")

    p = models.Portfolio(
        name=clean_name,
        description=portfolio_in.description,
        benchmark=portfolio_in.benchmark or "SPY",
        cash_balance=portfolio_in.cash_balance if portfolio_in.cash_balance is not None else 10000.0
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    if portfolio_in.initial_holdings:
        seen_tickers = set()
        for item in portfolio_in.initial_holdings:
            ticker_clean = item.ticker.strip().upper()
            if ticker_clean in seen_tickers:
                continue
            seen_tickers.add(ticker_clean)

            ticker_upper, current_price, name, asset_class, currency = resolve_price_and_meta(
                ticker_clean, item.current_price or item.buy_price, item.name, item.asset_class
            )
            buy_price = item.buy_price if (item.buy_price is not None and item.buy_price > 0) else current_price

            h = models.Holding(
                portfolio_id=p.id,
                ticker=ticker_upper,
                name=name,
                asset_class=asset_class,
                quantity=float(item.quantity),
                buy_price=float(buy_price),
                current_price=float(current_price),
                currency=currency,
                last_updated=datetime.utcnow(),
                notes=item.notes
            )
            db.add(h)
        db.commit()
        db.refresh(p)

    return p

def update_portfolio(db: Session, portfolio_id: int, portfolio_in: schemas.PortfolioUpdate) -> Optional[models.Portfolio]:
    p = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not p:
        return None

    if portfolio_in.name is not None:
        clean_name = portfolio_in.name.strip()
        if not clean_name:
            raise HTTPException(status_code=400, detail="Portfolio name cannot be blank or empty.")
        p.name = clean_name
    if portfolio_in.description is not None:
        p.description = portfolio_in.description
    if portfolio_in.benchmark is not None:
        p.benchmark = portfolio_in.benchmark
    if portfolio_in.cash_balance is not None:
        p.cash_balance = portfolio_in.cash_balance

    db.commit()
    db.refresh(p)
    return p

def delete_portfolio(db: Session, portfolio_id: int) -> bool:
    p = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not p:
        return False
    db.delete(p)
    db.commit()
    return True

def add_holding(db: Session, portfolio_id: int, holding_in: schemas.HoldingCreate) -> models.Holding:
    # 1. Verify portfolio exists
    p = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found.")

    # 2. Validate ticker format
    ticker_raw = (holding_in.ticker or "").strip()
    if not ticker_raw:
        raise HTTPException(status_code=400, detail="Stock ticker symbol cannot be empty.")
    
    ticker_upper = ticker_raw.upper()
    if not re.match(r"^[A-Z0-9.\-]{1,10}$", ticker_upper):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid ticker symbol '{ticker_raw}'. Please provide a valid 1-10 character symbol (e.g., AAPL, NVDA, SPY)."
        )

    # 3. Validate quantity
    if holding_in.quantity is None or float(holding_in.quantity) <= 0:
        raise HTTPException(
            status_code=400,
            detail="Holding quantity must be a positive number greater than 0."
        )

    # 4. Validate duplicate holding within this portfolio
    existing = db.query(models.Holding).filter(
        models.Holding.portfolio_id == portfolio_id,
        func.upper(models.Holding.ticker) == ticker_upper
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Holding '{ticker_upper}' already exists in this portfolio. You can update its quantity in the holdings table."
        )

    # 5. Resolve available price, currency, and metadata
    ticker_upper, available_price, name, asset_class, currency = resolve_price_and_meta(
        ticker_upper, holding_in.current_price, holding_in.name, holding_in.asset_class
    )
    buy_price = holding_in.buy_price if (holding_in.buy_price is not None and holding_in.buy_price > 0) else available_price

    # 6. Save holding to database
    h = models.Holding(
        portfolio_id=portfolio_id,
        ticker=ticker_upper,
        name=name,
        asset_class=asset_class,
        quantity=float(holding_in.quantity),
        buy_price=float(buy_price),
        current_price=float(available_price),
        currency=currency,
        last_updated=datetime.utcnow(),
        notes=holding_in.notes
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return h

def update_holding(db: Session, holding_id: int, holding_in: schemas.HoldingUpdate) -> models.Holding:
    h = db.query(models.Holding).filter(models.Holding.id == holding_id).first()
    if not h:
        raise HTTPException(status_code=404, detail=f"Holding with ID {holding_id} not found.")

    if holding_in.quantity is not None:
        if float(holding_in.quantity) <= 0:
            raise HTTPException(status_code=400, detail="Holding quantity must be a positive number greater than 0.")
        h.quantity = float(holding_in.quantity)
    if holding_in.buy_price is not None:
        if float(holding_in.buy_price) < 0:
            raise HTTPException(status_code=400, detail="Purchase price cannot be negative.")
        h.buy_price = float(holding_in.buy_price)
    if holding_in.current_price is not None:
        if float(holding_in.current_price) < 0:
            raise HTTPException(status_code=400, detail="Current price cannot be negative.")
        h.current_price = float(holding_in.current_price)
    if holding_in.currency is not None:
        h.currency = holding_in.currency
    if holding_in.notes is not None:
        h.notes = holding_in.notes
    if holding_in.name is not None:
        h.name = holding_in.name
    if holding_in.asset_class is not None:
        h.asset_class = holding_in.asset_class

    h.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(h)
    return h

def delete_holding(db: Session, holding_id: int) -> bool:
    h = db.query(models.Holding).filter(models.Holding.id == holding_id).first()
    if not h:
        raise HTTPException(status_code=404, detail=f"Holding with ID {holding_id} not found.")
    db.delete(h)
    db.commit()
    return True
