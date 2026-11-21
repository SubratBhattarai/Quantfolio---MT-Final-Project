# Quantfolio — Portfolio Analytics & Risk Management Platform

## 1. Project Name and Description

**Project Name:** Quantfolio

**Description:**

Quantfolio is a web-based investment portfolio analytics and risk management platform designed to help individual investors monitor, understand, and evaluate their investments. The application will provide a centralized dashboard where users can manage stock holdings, track portfolio performance, analyze risk, and receive AI-powered explanations of important financial metrics.

The goal is to make quantitative investment concepts more accessible through clear visualizations, useful analytics, and an intuitive interface.

## 2. Problem the Application Solves

Individual investors often use multiple platforms and spreadsheets to monitor their investments. While these tools may provide stock prices and basic portfolio values, they do not always make it easy to understand overall portfolio risk, diversification, performance, or potential weaknesses.

Quantfolio aims to address this problem by bringing portfolio tracking, quantitative analytics, and understandable risk insights into one application.

It will help users move beyond simply knowing how much their investments are worth and toward understanding how their portfolio behaves and what risks it carries.

## 3. Planned Features

### Portfolio Management
- Create and manage investment portfolios.
- Add stocks and specify quantities and purchase prices.
- Edit or remove existing holdings.
- View all holdings in one dashboard.

### Market Data and Portfolio Analytics
- Retrieve and display current stock prices.
- Calculate total portfolio value.
- Track portfolio performance and returns.
- Display important portfolio metrics and visualizations.

### Risk Management
- Calculate portfolio volatility.
- Analyze asset allocation and diversification.
- Display risk indicators and potential portfolio weaknesses.
- Help users understand how individual holdings contribute to overall portfolio risk.

### AI-Powered Insights
- Generate plain-language portfolio summaries.
- Explain financial and quantitative metrics.
- Identify notable portfolio risks and unusual patterns.
- Provide educational insights to help users interpret their analytics.

*Quantfolio is intended as an analytics and educational tool, not a source of guaranteed returns or personalized financial advice.*

## 4. Planned Technology Stack

| Component | Planned Technology | Purpose |
|---|---|---|
| Frontend | React.js | Build the interactive user interface |
| Styling | Tailwind CSS | Create a clean, responsive white design |
| Backend | Python with FastAPI | Handle application logic and API requests |
| Database | SQLite & SQLAlchemy | Store portfolios, holdings, and cash buffers |
| Market Data Service | Yahoo Finance Normalized Feed | Retrieve multi-asset pricing & market feeds |
| Quantitative Analytics | Pandas & NumPy | Calculate Beta, Volatility, Sharpe Ratio, and HHI |
| Version Control | Git and GitHub | Track code changes and collaborate |

### Market Data Provider, API Limits & Attribution
- **Provider**: **Yahoo Finance Normalized Feed** with in-memory TTL caching (see [docs/MARKET_DATA_PROVIDER.md](docs/MARKET_DATA_PROVIDER.md)).
- **Rate Limits**: Up to ~2,000 requests/hour; cached with a 5-minute (300s) TTL to respect fair-use policy.
- **Data Latency**: 15–20 minutes delayed for US exchanges.
- **Attribution Requirement**: *"Market data provided via Yahoo Finance & Normalized Exchange Feeds. Quotes are delayed by 15-20 minutes. Strictly intended for educational and non-commercial portfolio analytics."*
- **Base Currency**: `USD`. Price, currency, and last-updated sync times are displayed on every position.


## 5. Basic Project Goals

1. Build a functional portfolio management system where users can create portfolios and manage stock holdings.
2. Integrate market data to calculate and display portfolio valuations.
3. Implement useful quantitative metrics to evaluate portfolio performance and risk.
4. Present financial information through clear dashboards and visualizations.
5. Integrate AI-powered explanations to make complex financial metrics easier to understand.
6. Develop a maintainable, modular application with a clear separation between frontend, backend, and data layers.
7. Deliver a working Minimum Viable Product (MVP) by Unit 12 and a more complete application by Unit 14.

## 6. Development Plan

**Sprint 1 — MVP (Unit 12)**
- As an investor, I want to create a portfolio so that I can organize the stocks I want to monitor.
- As an investor, I want to add stocks to my portfolio so that I can track the assets I am interested in.
- As an investor, I want to edit or remove a holding so that my portfolio stays accurate when my positions change.
- As an investor, I want to see current stock prices so that I can understand the latest value of my holdings.
- As an investor, I want to see my portfolio's total value so that I can understand how much my investments are worth.
**Sprint 2 — Final Application (Units 13–14)**
- As an investor, I want to view performance and risk indicators so that I can better understand portfolio behavior.
- As an investor, I want to receive an AI-generated summary of my portfolio so that I can quickly understand its main characteristics.
- As an investor, I want AI to explain financial metrics in simple language so that I can understand what the numbers mean.
- As an investor, I want AI to identify notable portfolio risks so that I know which areas may need further review.


## Expected Outcome

The final product will be a functional web application that allows users to manage their investment portfolios, monitor performance, understand risk, and interpret quantitative financial information through an accessible dashboard.

## 7. Setup & Run Instructions

Quantfolio is designed for finance and quant interested students:
- **Database**: Embedded SQLite database (`backend/quantfolio.db`).
- **Backend**: FastAPI with Python and SQLAlchemy ORM.
- **Frontend**: React with Vite, Tailwind CSS, and Lucide icons.

### 1. Start the Backend API
```bash
# Navigate to project root
python -m uvicorn backend.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173/`

### 3. Run Automated Acceptance Criteria Verification
```bash
python backend/test_quantfolio.py
```
This suite automatically verifies:
- Holding quantity updates (`PUT /api/holdings/{id}`)
- Holding removals with confirmation (`DELETE /api/holdings/{id}`)
- Persistence after page refresh (re-fetching from SQLite database)

