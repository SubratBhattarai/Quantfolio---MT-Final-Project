from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator

# --- Holding Schemas ---
class HoldingBase(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=20, description="Asset ticker symbol, e.g. NVDA, AAPL")
    quantity: float = Field(..., gt=0, description="Quantity/shares held (must be > 0)")
    buy_price: Optional[float] = Field(None, ge=0, description="Average purchase price (cost basis). Defaults to available price if omitted.")
    current_price: Optional[float] = Field(None, ge=0, description="Current market price / available price")
    currency: Optional[str] = Field("USD", max_length=10, description="Price currency (default USD)")
    name: Optional[str] = Field(None, max_length=100, description="Company or asset name")
    asset_class: Optional[str] = Field("Equities", max_length=50, description="Asset class category")
    notes: Optional[str] = Field(None, description="Quant rationale or investment thesis")

    @field_validator('quantity')
    @classmethod
    def validate_holding_quantity(cls, v: float) -> float:
        if v is None or v <= 0:
            raise ValueError("Holding quantity must be a positive number greater than 0.")
        return v

    @field_validator('ticker')
    @classmethod
    def validate_ticker(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Stock ticker cannot be empty.")
        return v.strip().upper()

class HoldingCreate(HoldingBase):
    pass

class HoldingUpdate(BaseModel):
    quantity: Optional[float] = Field(None, description="Updated quantity/shares held")
    buy_price: Optional[float] = Field(None, ge=0, description="Updated cost basis")
    current_price: Optional[float] = Field(None, ge=0, description="Updated available price")
    currency: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None
    name: Optional[str] = None
    asset_class: Optional[str] = None

    @field_validator('quantity')
    @classmethod
    def validate_update_quantity(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Holding quantity must be a positive number greater than 0.")
        return v

class HoldingResponse(HoldingBase):
    id: int
    portfolio_id: int
    current_price: float
    available_price: float = 0.0
    currency: str = "USD"
    last_updated: Optional[datetime] = None
    formatted_last_updated: str = ""
    day_change: float = 0.0
    day_change_percent: float = 0.0
    created_at: datetime
    updated_at: datetime
    market_value: float = 0.0
    cost_basis: float = 0.0
    unrealized_pnl: float = 0.0
    unrealized_pnl_percent: float = 0.0
    weight_percent: float = 0.0

    class Config:
        from_attributes = True

# --- Portfolio Schemas ---
class PortfolioBase(BaseModel):
    name: str = Field(..., max_length=100, description="Portfolio name")
    description: Optional[str] = Field(None, description="Strategy thesis, quantitative factor focus")
    benchmark: Optional[str] = Field("SPY", max_length=50, description="Benchmark ticker, e.g. SPY, QQQ")
    cash_balance: Optional[float] = Field(10000.0, ge=0, description="Unallocated cash balance")

    @field_validator('name')
    @classmethod
    def validate_portfolio_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Portfolio name cannot be blank or empty.")
        return v.strip()

class PortfolioCreate(PortfolioBase):
    initial_holdings: Optional[List[HoldingCreate]] = Field(default=[], description="Optional initial holdings")

class PortfolioUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    benchmark: Optional[str] = None
    cash_balance: Optional[float] = Field(None, ge=0)

    @field_validator('name')
    @classmethod
    def validate_update_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Portfolio name cannot be blank or empty.")
        return v.strip() if v is not None else None

class PortfolioSummary(PortfolioBase):
    id: int
    currency: str = "USD"
    created_at: datetime
    updated_at: datetime
    total_market_value: float = 0.0
    total_portfolio_value: float = 0.0
    total_cost: float = 0.0
    total_unrealized_pnl: float = 0.0
    total_unrealized_pnl_percent: float = 0.0
    holdings_count: int = 0
    top_holdings: List[str] = []

    class Config:
        from_attributes = True

class PortfolioDetail(PortfolioSummary):
    holdings: List[HoldingResponse] = []
    asset_allocation: dict = {}
    risk_metrics: Optional[Dict[str, Any]] = None
    market_data_attribution: Optional[Dict[str, str]] = None
    formatted_last_updated: str = ""
