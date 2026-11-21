import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, init_db
from . import models, schemas, crud
from .seed_data import seed_database
from .market_service import market_service

# Initialize database schema and perform self-healing column migrations
init_db()
# Populate sample quant portfolios for finance students on first boot
seed_database()

app = FastAPI(
    title="Quantfolio API",
    description="Backend API for Quantfolio - Quantitative Portfolio Analytics & Risk Management Platform for Finance Students",
    version="1.0.0"
)

# Enable CORS for frontend web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "app": "Quantfolio API",
        "status": "online",
        "docs": "/docs",
        "market_data_provider": market_service.get_attribution()["provider"],
        "description": "Quant portfolio management backend"
    }

# --- Market Data & Attribution Endpoints ---

@app.get("/api/market/attribution", summary="Retrieve market data provider attribution and compliance limits")
def get_market_attribution():
    """Returns official provider attribution, rate limits, and latency disclaimers."""
    return market_service.get_attribution()

@app.get("/api/quotes/{ticker}", summary="Lookup normalized ticker pricing info")
def lookup_quote(ticker: str):
    """Normalized stock quote and available price lookup via MarketDataService."""
    quote = market_service.get_normalized_quote(ticker)
    return {
        "ticker": quote.get("ticker", ticker.upper()),
        "price": quote.get("price", 100.0),
        "available_price": quote.get("price", 100.0),
        "currency": quote.get("currency", "USD"),
        "name": quote.get("name", f"{ticker.upper()} Holding"),
        "asset_class": quote.get("asset_class", "Equities"),
        "day_change": quote.get("day_change", 0.0),
        "day_change_percent": quote.get("day_change_percent", 0.0),
        "last_updated": quote.get("last_updated"),
        "formatted_time": quote.get("formatted_time"),
        "source": quote.get("source"),
        "attribution": market_service.get_attribution()
    }

# --- Portfolio Endpoints ---

@app.get("/api/portfolios", response_model=List[schemas.PortfolioSummary], summary="Retrieve all portfolios")
def get_all_portfolios(db: Session = Depends(get_db)):
    """Retrieve all portfolios with calculated valuations, performance metrics, and top holdings."""
    return crud.get_portfolios(db)

@app.post("/api/portfolios", response_model=schemas.PortfolioSummary, status_code=status.HTTP_201_CREATED, summary="Create a new portfolio")
def create_new_portfolio(portfolio_in: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    """Create a new portfolio with optional initial holdings."""
    portfolio = crud.create_portfolio(db, portfolio_in)
    detail = crud.get_portfolio(db, portfolio.id)
    return detail

@app.get("/api/portfolios/{portfolio_id}", response_model=schemas.PortfolioDetail, summary="Retrieve single portfolio detail with risk metrics")
def get_single_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Retrieve full details of a portfolio including holdings, weights, asset allocation, and quant risk metrics."""
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    return portfolio

@app.put("/api/portfolios/{portfolio_id}", response_model=schemas.PortfolioSummary, summary="Update portfolio metadata")
def update_existing_portfolio(portfolio_id: int, portfolio_in: schemas.PortfolioUpdate, db: Session = Depends(get_db)):
    """Update portfolio name, description, benchmark, or cash balance."""
    updated = crud.update_portfolio(db, portfolio_id, portfolio_in)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    return crud.get_portfolio(db, portfolio_id)

@app.delete("/api/portfolios/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a portfolio")
def delete_existing_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Delete a portfolio and all associated holdings."""
    success = crud.delete_portfolio(db, portfolio_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Portfolio with ID {portfolio_id} not found")
    return None

# --- Holdings Endpoints ---

@app.post("/api/portfolios/{portfolio_id}/holdings", response_model=schemas.HoldingResponse, status_code=status.HTTP_201_CREATED, summary="Add holding to portfolio")
def add_holding_to_portfolio(portfolio_id: int, holding_in: schemas.HoldingCreate, db: Session = Depends(get_db)):
    """
    Add a new stock or asset holding to an existing portfolio.
    Validates ticker, quantity > 0, checks for duplicate holdings, and resolves normalized market price.
    """
    holding = crud.add_holding(db, portfolio_id, holding_in)
    portfolio = crud.get_portfolio(db, portfolio_id)
    enriched = next((h for h in portfolio.holdings if h.id == holding.id), None)
    return enriched or crud.enrich_holding_dict(holding, portfolio.total_portfolio_value)

@app.put("/api/holdings/{holding_id}", response_model=schemas.HoldingResponse, summary="Update holding quantity and details")
def update_holding_endpoint(holding_id: int, holding_in: schemas.HoldingUpdate, db: Session = Depends(get_db)):
    """
    Update a holding's quantity, buy price, current price, or notes.
    """
    holding = crud.update_holding(db, holding_id, holding_in)
    portfolio = crud.get_portfolio(db, holding.portfolio_id)
    enriched = next((h for h in portfolio.holdings if h.id == holding.id), None)
    return enriched or crud.enrich_holding_dict(holding, portfolio.total_portfolio_value)

@app.delete("/api/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove a holding")
def delete_holding_endpoint(holding_id: int, db: Session = Depends(get_db)):
    """
    Delete a holding from its portfolio.
    """
    success = crud.delete_holding(db, holding_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Holding with ID {holding_id} not found")
    return None

@app.post("/api/reset-demo", summary="Reset database to starter quant demo state")
def reset_demo(db: Session = Depends(get_db)):
    """Allows resetting demo data at any time for presentations or testing."""
    db.query(models.Holding).delete()
    db.query(models.Portfolio).delete()
    db.commit()
    seed_database()
    return {"message": "Demo data successfully reset"}
