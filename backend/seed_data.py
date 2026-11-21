from .database import SessionLocal, engine, Base
from . import models, crud

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(models.Portfolio).count()
        if count > 0:
            return  # Already seeded

        # Portfolio 1: Momentum & AI Growth
        p1 = models.Portfolio(
            name="Algorithmic Momentum & AI Growth",
            description="Quantitative cross-sectional momentum factor strategy overweighting leading semiconductor and cloud AI infrastructure leaders.",
            benchmark="QQQ",
            cash_balance=15000.0
        )
        db.add(p1)
        db.commit()
        db.refresh(p1)

        holdings_p1 = [
            ("NVDA", "NVIDIA Corp.", "Equities", 60.0, 115.00, 138.80, "Momentum quintile 1; primary data center GPU compute thesis."),
            ("MSFT", "Microsoft Corp.", "Equities", 30.0, 405.00, 425.20, "Enterprise cloud copilot monetization; stable free cash flow."),
            ("AAPL", "Apple Inc.", "Equities", 45.0, 210.00, 228.50, "Edge-AI device refresh cycle catalyst."),
            ("AMZN", "Amazon.com Inc.", "Equities", 40.0, 185.00, 204.60, "AWS cloud margin expansion and automated fulfillment."),
            ("PLTR", "Palantir Technologies", "Equities", 120.0, 42.00, 64.20, "High velocity AIP enterprise customer adoption; quantitative breakout.")
        ]
        for t, n, ac, q, bp, cp, notes in holdings_p1:
            db.add(models.Holding(
                portfolio_id=p1.id,
                ticker=t,
                name=n,
                asset_class=ac,
                quantity=q,
                buy_price=bp,
                current_price=cp,
                notes=notes
            ))

        # Portfolio 2: Risk Parity & Macro Diversification
        p2 = models.Portfolio(
            name="Multi-Asset Risk Parity Strategy",
            description="Risk-weighted asset allocation balancing equity volatility with sovereign duration hedging, gold, and small-cap alpha.",
            benchmark="SPY",
            cash_balance=8500.0
        )
        db.add(p2)
        db.commit()
        db.refresh(p2)

        holdings_p2 = [
            ("SPY", "SPDR S&P 500 ETF Trust", "ETFs", 50.0, 540.00, 592.50, "Core market beta anchor position."),
            ("TLT", "iShares 20+ Year Treasury Bond ETF", "Fixed Income", 100.0, 98.00, 92.40, "Macro duration hedge against deflationary shock."),
            ("GLD", "SPDR Gold Shares", "Commodities", 40.0, 220.00, 248.50, "Systemic monetary debasement and real yield hedge."),
            ("IWM", "iShares Russell 2000 ETF", "ETFs", 45.0, 215.00, 235.80, "Domestic rate-sensitive small cap mean reversion exposure.")
        ]
        for t, n, ac, q, bp, cp, notes in holdings_p2:
            db.add(models.Holding(
                portfolio_id=p2.id,
                ticker=t,
                name=n,
                asset_class=ac,
                quantity=q,
                buy_price=bp,
                current_price=cp,
                notes=notes
            ))

        # Portfolio 3: Quality Compounders
        p3 = models.Portfolio(
            name="Quality Factor & High-ROIC Compounders",
            description="Fundamental quant screen targeting sustained return on invested capital, pristine balance sheets, and competitive moats.",
            benchmark="SPY",
            cash_balance=12000.0
        )
        db.add(p3)
        db.commit()
        db.refresh(p3)

        holdings_p3 = [
            ("JPM", "JPMorgan Chase & Co.", "Equities", 45.0, 210.00, 242.10, "Fortress balance sheet and net interest income leadership."),
            ("BRK.B", "Berkshire Hathaway Inc.", "Equities", 35.0, 430.00, 465.30, "Diversified industrial cash generation and deep capital buffer."),
            ("GOOGL", "Alphabet Inc.", "Equities", 55.0, 165.00, 181.40, "Core search search monopoly + YouTube + Google Cloud growth.")
        ]
        for t, n, ac, q, bp, cp, notes in holdings_p3:
            db.add(models.Holding(
                portfolio_id=p3.id,
                ticker=t,
                name=n,
                asset_class=ac,
                quantity=q,
                buy_price=bp,
                current_price=cp,
                notes=notes
            ))

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully!")
