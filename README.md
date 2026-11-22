# Quantfolio — Portfolio Analytics & Risk Management Platform

**A web-based portfolio analytics and risk management platform built with React, FastAPI, Python, and Google Cloud Run.**

<details>
<summary>Project Links</summary>

- **Live Application:** https://quantfolio-frontend-74735219876.us-central1.run.app/
- **Backend API:** https://quantfolio-backend-74735219876.us-central1.run.app/
- **API Documentation:** https://quantfolio-backend-74735219876.us-central1.run.app/docs
- **Backend Portfolio Endpoint:** https://quantfolio-backend-74735219876.us-central1.run.app/api/portfolios

</details>

<image>
<img width="956" height="566" alt="image" src="https://github.com/user-attachments/assets/2bde4344-b888-43db-875f-c76169d95298" />
</image>

---

## 1. Project Overview

Quantfolio is a web-based investment portfolio analytics and risk management platform designed to help individual investors monitor, understand, and evaluate their investments.

The application provides a centralized dashboard for managing stock holdings, tracking portfolio performance, analyzing risk, and interpreting important financial metrics.

The goal is to make quantitative investment concepts more accessible through clear visualizations, useful analytics, and an intuitive user interface.

Rather than simply showing investors how much their investments are worth, Quantfolio aims to help them understand how their portfolios behave, how their assets are distributed, and what risks they carry.

## 2. Problem Statement

Individual investors often rely on multiple platforms and spreadsheets to monitor their investments. Although these tools provide stock prices and basic portfolio valuations, they do not always make it easy to understand overall portfolio risk, diversification, performance, or potential weaknesses.

Quantfolio addresses this problem by bringing portfolio tracking, quantitative analytics, and understandable risk insights into one application.

The platform aims to help investors move beyond tracking portfolio value toward understanding portfolio behavior and risk exposure.

## 3. Core Features

### Portfolio Management
- Create and manage investment portfolios.
- Add stocks and specify quantities and purchase prices.
- Edit or remove existing holdings.
- View portfolio holdings through a centralized dashboard.

### Market Data and Portfolio Analytics
- Retrieve and display stock prices.
- Calculate total portfolio value.
- Track portfolio performance and returns.
- Display important financial metrics and visualizations.

### Risk Management
- Calculate portfolio volatility.
- Analyze asset allocation and diversification.
- Display risk indicators and potential portfolio weaknesses.
- Evaluate how individual holdings contribute to overall portfolio risk.

### AI-Powered Insights
- Generate plain-language portfolio summaries.
- Explain financial and quantitative metrics.
- Identify notable portfolio risks and unusual patterns.
- Provide educational insights to help users interpret their analytics.

*Note: Features are subject to the current implementation and development status. The remaining functionality continues to evolve.*

---

## 4. Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Interactive user interface |
| Build Tool | Vite | Frontend development and production builds |
| Styling | Tailwind CSS | Responsive application styling |
| Icons | Lucide | Interface icons |
| Backend | Python, FastAPI | Application logic and REST API |
| Database | SQLite, SQLAlchemy | Portfolio and holding data |
| Market Data | Yahoo Finance Normalized Feed | Market pricing and financial data |
| Quantitative Analytics | Pandas, NumPy | Financial calculations and analytics |
| Containerization | Docker | Application packaging |
| Container Registry | Google Artifact Registry | Docker image storage |
| Cloud Build | Google Cloud Build | Remote Docker image builds |
| Cloud Hosting | Google Cloud Run | Frontend and backend deployment |
| Version Control | Git, GitHub | Source control and development |

### Market Data Provider, API Limits & Attribution

- **Provider:** Yahoo Finance Normalized Feed.
- **Caching:** In-memory TTL caching with a 5-minute (300-second) TTL.
- **Rate Limits:** Approximately 2,000 requests/hour, subject to provider limitations.
- **Data Latency:** US exchange quotes may be delayed by 15–20 minutes.
- **Base Currency:** USD.

Required market data attribution:

> Market data provided via Yahoo Finance & Normalized Exchange Feeds. Quotes are delayed by 15–20 minutes. Strictly intended for educational and non-commercial portfolio analytics.

Price, currency, and last-updated synchronization times are displayed for positions.

---

## 5. Application Architecture

Quantfolio uses a separate frontend and backend architecture.

```text
                  User / Browser
                        |
                        v
              Google Cloud Run
                Frontend Service
                  React + Vite
                     Nginx
                        |
                        | /api/*
                        v
              Google Cloud Run
                Backend Service
                 Python + FastAPI
                        |
                        v
                  SQLite Database
```

### Frontend
The React application is built using Vite and served through Nginx.

Nginx provides:
- Static frontend asset delivery.
- Single-page application routing fallback.
- Reverse proxying of `/api/*` requests to the backend.
- Same-origin API communication from the browser.

### Backend
The backend uses FastAPI to handle application logic and API requests.

It provides REST API endpoints for portfolio-related operations and communicates with the SQLite database through SQLAlchemy.

### Database
SQLite is currently used for application data storage.

The database stores portfolio-related information, including holdings and other application records.

---

## 6. Cloud Deployment

**Deployment Status: Successfully deployed**

Quantfolio is hosted using Google Cloud Run, with independent services for the frontend and backend.

### Live Deployment

| Service | Cloud Run Service | Status |
|---|---|---|
| Frontend | quantfolio-frontend | Deployed |
| Backend | quantfolio-backend | Deployed |

**Frontend URL:**

https://quantfolio-frontend-74735219876.us-central1.run.app/

**Backend URL:**

https://quantfolio-backend-74735219876.us-central1.run.app/

### Google Cloud Configuration

| Configuration | Value |
|---|---|
| Cloud Platform | Google Cloud Platform |
| Project ID | project-07893711-6953-41c9-aa4 |
| Region | us-central1 |
| Container Registry | Artifact Registry |
| Repository | quantfolio |
| Build Service | Google Cloud Build |
| Hosting Service | Google Cloud Run |
| Frontend Container Port | 80 |
| Backend Container Port | 8080 |

### Deployment Workflow

The deployment process follows these steps:

1. Maintain application source code in the GitHub repository.
2. Build the backend Docker image using Google Cloud Build.
3. Push the backend image to Google Artifact Registry.
4. Deploy the backend image to Google Cloud Run.
5. Configure the frontend Nginx reverse proxy to communicate with the deployed backend.
6. Build the frontend Docker image using a separate Cloud Build configuration.
7. Push the frontend image to Google Artifact Registry.
8. Deploy the frontend image to Google Cloud Run.
9. Verify the frontend, backend API, and reverse proxy communication.

### Docker Images

Both container images are stored in Google Artifact Registry:

```text
us-central1-docker.pkg.dev/
project-07893711-6953-41c9-aa4/
quantfolio/backend:v1
```

```text
us-central1-docker.pkg.dev/
project-07893711-6953-41c9-aa4/
quantfolio/frontend:v1
```

### Deployment Configuration

The frontend uses a dedicated Cloud Run configuration to preserve local Docker Compose functionality.

Relevant files:

```text
frontend/
├── Dockerfile
├── Dockerfile.cloudrun
├── nginx.conf
├── nginx.cloudrun.conf
└── cloudbuild.yaml
```

- `Dockerfile`: Local frontend container configuration.
- `Dockerfile.cloudrun`: Cloud Run frontend container configuration.
- `nginx.conf`: Local Docker Compose reverse proxy.
- `nginx.cloudrun.conf`: Production reverse proxy pointing to the deployed backend.
- `cloudbuild.yaml`: Google Cloud Build configuration for the frontend.

---

## 7. Local Development Setup

Quantfolio can also be run locally for development and testing.

### Prerequisites

- Python 3.10+
- Node.js 20+
- npm
- Git

### Clone the Repository

```bash
git clone https://github.com/SubratBhattarai/Quantfolio---MT-Final-Project.git

cd Quantfolio---MT-Final-Project
```

Switch to the development branch if necessary:

```bash
git checkout develop
```

### 1. Start the Backend API

From the project root:

```bash
python -m venv .venv
```

Activate the environment.

**Windows:**

```powershell
.venv\Scripts\activate
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install the backend dependencies using the repository's dependency file:

```bash
pip install -r backend/requirements.txt
```

Start the API:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Backend endpoints:

- API: http://localhost:8000/
- Swagger API Documentation: http://localhost:8000/docs

### 2. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

http://localhost:5173/

### 3. Run Automated Verification

From the project root:

```bash
python backend/test_quantfolio.py
```

The acceptance verification suite checks:

- Holding quantity updates (`PUT /api/holdings/{id}`)
- Holding removals with confirmation (`DELETE /api/holdings/{id}`)
- Data persistence after page refresh through database re-fetching.

---

## 8. Development Roadmap

### Sprint 1 — MVP (Unit 12)

- [x] Configure Google Cloud project.
- [x] Build backend Docker image.
- [x] Push backend image to Artifact Registry.
- [x] Deploy backend to Google Cloud Run.
- [x] Configure frontend Cloud Run reverse proxy.
- [x] Build frontend Docker image.
- [x] Push frontend image to Artifact Registry.
- [x] Deploy frontend to Google Cloud Run.
- [x] Obtain public deployment URL.
- [x] Verify frontend and backend connectivity.

### Sprint 2 — Final Application (Units 13–14)

- [ ] Complete portfolio performance and risk indicators.
- [ ] Improve asset allocation and diversification analysis.
- [ ] Integrate AI-generated portfolio summaries.
- [ ] Add plain-language financial metric explanations.
- [ ] Improve portfolio risk identification.
- [ ] Expand testing and error handling.
- [ ] Improve application monitoring and reliability.

---

## 9. Testing and Verification

The deployed application was tested to verify:

- Frontend loads successfully through the public Cloud Run URL.
- Backend root endpoint responds successfully.
- `/api/portfolios` returns portfolio data.
- Frontend can communicate with the backend through Nginx.
- Application pages can be accessed through the deployed URL.

**Deployment result: Successful.**

---

## 10. Known Limitations and Future Improvements

### Database Persistence

The current backend uses SQLite stored in the Cloud Run container's local filesystem.

Cloud Run container filesystems are ephemeral. Data is not guaranteed to survive instance restarts, replacement, or scaling down.

For a production-ready deployment, the application should migrate to persistent managed database storage.

### Future Improvements

- Migrate SQLite to a managed persistent database.
- Implement automated CI/CD using GitHub Actions.
- Improve authentication and user account management.
- Expand automated integration and acceptance testing.
- Improve monitoring, logging, and error handling.
- Optimize backend performance and market data caching.
- Expand quantitative analytics and AI-powered insights.

---

## 11. Project Goals

The primary objectives of Quantfolio are:

1. Build a functional portfolio management system.
2. Integrate market data for portfolio valuation.
3. Implement quantitative metrics to evaluate portfolio performance and risk.
4. Present financial information through understandable dashboards and visualizations.
5. Integrate AI-powered explanations for complex financial metrics.
6. Maintain a modular architecture separating frontend, backend, and data layers.
7. Deliver a working MVP and progressively expand it into a more complete analytics platform.

## 12. Disclaimer

Quantfolio is an educational and analytical project. It is designed to demonstrate portfolio management, quantitative finance, software development, and risk analysis concepts.

It is not a registered investment adviser, brokerage, or financial advisory service. Its analytics and insights should not be interpreted as personalized investment recommendations or guarantees of investment returns.

---

**Project:** Quantfolio — Portfolio Analytics & Risk Management Platform  
**Repository:** GitHub  
**Development Branch:** develop  
**Hosting:** Google Cloud Run  
**Deployment Status:** Successfully deployed
