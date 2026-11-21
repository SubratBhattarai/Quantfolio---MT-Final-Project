# Market Data Provider Documentation & Integration Guide

## 1. Selected Market Data Provider
**Primary Provider:** **Yahoo Finance Market Data API (Normalized v8 Feed)**  
**Secondary / Compatible Feeds:** **Finnhub Stock API** and **Financial Modeling Prep (FMP)**

### Why Yahoo Finance Was Chosen
1. **Academic and Educational Standard:** Yahoo Finance is the most widely adopted data source for quantitative finance courses, university investment clubs, and student portfolios.
2. **Comprehensive Multi-Asset Coverage:**
   - **US Equities:** AAPL, NVDA, MSFT, GOOGL, AMZN, META, TSLA, etc.
   - **Exchange Traded Funds (ETFs):** SPY (S&P 500), QQQ (Nasdaq 100), IWM (Russell 2000).
   - **Fixed Income ETFs:** TLT (20+ Year Treasury), AGG (US Aggregate Bond).
   - **Commodities:** GLD (SPDR Gold Shares), SLV (Silver).
   - **Digital Assets:** BTC-USD, ETH-USD.
3. **Frictionless Student Access:** Does not require students to submit credit cards or generate personal access tokens that risk credential leakage in classroom repositories.

---

## 2. API Limits & Rate Limiting Strategy

| Provider | Free Tier Rate Limit | Data Latency | API Key Required |
|---|---|---|---|
| **Yahoo Finance Normalized Feed** | ~2,000 requests/hour per IP (~5 req/sec burst) | 15–20 minutes delayed (US Exchanges) | No |
| **Finnhub Stock API** | 60 requests/minute | Real-time / 15-min delayed | Yes |
| **Alpha Vantage** | 25 requests/day (Free tier) | 15-min delayed | Yes |

### Rate Limiting & Resilience Architecture in Quantfolio
To strictly adhere to fair-use policies and ensure the application never hits rate-limit bans or crashes mid-presentation:
1. **In-Memory TTL Caching (`backend/market_service.py`):**
   - Quotes are cached with a **5-minute (300 seconds) Time-To-Live (TTL)**.
   - Subsequent requests for the same security (e.g. SPY benchmark queried by multiple portfolios) return instantly from cache with $0$ redundant network calls.
2. **Graceful Fallback & Safe Missing Data Handling:**
   - If a provider is temporarily unreachable, rate-limited, or experiencing network latency, the service gracefully serves normalized reference prices with a clear `source="Normalized Reference Feed"` flag.
   - Unrecognized or newly IPO'd tickers are handled safely without unhandled exceptions.

---

## 3. Attribution & Usage Requirements

Under exchange compliance rules and terms of service:
1. **Educational & Personal Use Only:**
   - The data is provided exclusively for non-commercial educational analytics, research, and classroom modeling.
   - It cannot be redistributed or used for live automated trade execution without commercial exchange licensing.
2. **Mandatory Display Attribution:**
   - Any view rendering market quotes must display clear attribution:
     > *"Market data provided via Yahoo Finance & Normalized Exchange Feeds. Quotes are delayed by 15-20 minutes. Intended strictly for educational portfolio analytics."*
   - Currency must be explicitly specified (default: `USD`).
   - Timestamps indicating the `Last Updated` synchronization time must be rendered alongside each price quote.
