# Navitix — Maritime Vessel Chartering Decision Dashboard

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F47B3A.svg)](https://opensource.org/licenses/MIT)

**Navitix** is a full-stack decision-support prototype built for the **Smart India Hackathon** problem statement **SIH26006** (Ministry of Steel). It helps chartering managers and bulk commodity traders answer:

> **"Given this cargo requirement and route, which vessel should I charter, when should I charter it, and what will it cost?"**

The system combines a **React dashboard** with a **Python FastAPI backend** running freight rate forecasting, port feasibility checks, and cost optimization.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Dashboard Pages](#dashboard-pages)
- [Backend Modules](#backend-modules)
- [REST API Reference](#rest-api-reference)
- [Model Evaluation & Validation](#model-evaluation--validation)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [Design System](#design-system)
- [Data Provenance](#data-provenance)

---

## How It Works

Navitix operates as a **three-layer pipeline**:

```
INPUT                        ANALYSIS                          DECISION
─────────────────────       ─────────────────────────         ─────────────────────────────
Cargo: 50,000 MT        ->  Port draft feasibility check  ->  Recommended: Panamax
Commodity: Coking Coal       Vessel class screening            Charter window: Day +3 to +5
Origin: Hay Point (AU)       14-day freight rate forecast      Expected cost: INR 14.22 Cr
Destination: Paradip (IN)    Multi-factor cost estimation      Confidence: 87%
Laycan: 15 Jul 2026          Risk & scenario analysis          Savings vs. next best: INR 1.35 Cr
```

1. **Input Layer** — User enters cargo type, tonnage, origin port, discharge port, target arrival date, and laycan window via the Voyage & Cargo Specifications panel. Custom inputs trigger a live backend call.
2. **Analysis Layer** — The backend validates vessel feasibility against port bathymetric envelopes (draft, LOA, beam), generates a 14-day freight rate trajectory using ARIMA + XGBoost, estimates voyage costs across candidate vessel classes, and runs risk audits.
3. **Decision Layer** — The dashboard presents the recommended vessel pick with itemized costs, a charter timing window aligned to the predicted rate trough, model confidence, and comparative analysis across all candidates.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI component framework |
| **Vite** | 5.4 | Build tool and dev server (HMR) |
| **Tailwind CSS** | v4 | Utility-first CSS with CSS variables |
| **Leaflet + React-Leaflet** | 1.9 / 5.0 | Interactive maritime route map with dark tiles |
| **Lucide React** | 1.41 | Icon library (Ship, Anchor, Award, etc.) |
| **clsx** | 2.1 | Conditional class name utility |
| **OxLint** | 1.79 | Fast JavaScript linter |

All chart visualizations (freight forecast timeline, cost breakdowns, draft spectrum bars) are built with **raw SVG** inside React components — no charting library dependency.

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11+ | Runtime |
| **FastAPI** | 0.115+ | Async REST API framework |
| **Uvicorn** | latest | ASGI server |
| **Pydantic** | 2.x | Request/response validation |
| **Statsmodels** | latest | ARIMA(2,1,2) time-series forecasting |
| **XGBoost** | latest | Gradient-boosted ensemble rate prediction |
| **scikit-learn** | latest | Feature preprocessing and model utilities |
| **pandas / NumPy** | latest | Data manipulation and numerical computation |
| **pytest + httpx** | latest | Test framework with async HTTP test client |

### Data Files (Backend)

| File | Contents |
|---|---|
| `contract.json` | Single source of truth for API request/response schema |
| `ports.json` | Port database with bathymetric envelopes (draft, LOA, beam, berth length, handling capacity) |
| `vessels.json` | Vessel fleet specifications (DWT, draft, LOA, beam, fuel consumption, demurrage rates) |
| `routes.json` | Sea distance overrides for known port pairs |
| `rates.csv` | Historical freight rate time-series data (synthetic, labeled) |

---

## Project Structure

```
charter-ai/
├── src/                          # React frontend source
│   ├── api/
│   │   ├── charterApi.js         # HTTP client for backend endpoints
│   │   └── adapter.js            # Transforms backend JSON -> dashboard data shape
│   ├── components/
│   │   ├── Header.jsx            # Top bar with active query display and mode indicator
│   │   ├── Sidebar.jsx           # Navigation sidebar with 7 page tabs
│   │   ├── RouteMap.jsx          # Leaflet maritime map with port markers and route line
│   │   └── CharterModal.jsx      # "Charter Now" confirmation modal
│   ├── pages/
│   │   ├── OverviewPage.jsx      # Decision dashboard home (hero card, KPIs, mini-chart)
│   │   ├── VesselRoutePage.jsx   # Voyage input, vessel cards, port constraint panels
│   │   ├── CompareVesselsPage.jsx# Side-by-side vessel comparison cards
│   │   ├── FreightForecastPage.jsx # Full SVG forecast chart with CI bands
│   │   ├── CostAnalysisPage.jsx  # Itemized cost breakdown and cross-fleet matrix
│   │   ├── RiskConfidencePage.jsx # Risk factors, scenarios, confidence gauge
│   │   └── SettingsPage.jsx      # Commercial assumptions and API telemetry
│   ├── hooks/
│   │   └── useRecommendation.js  # Core data hook: API fetch, debounce, mock fallback
│   ├── data/
│   │   └── mockData.js           # 3 pre-configured route fixtures for offline mode
│   ├── App.jsx                   # Root layout (sidebar + header + page router)
│   ├── App.css                   # Global component styles (card-shell, scrollbar, etc.)
│   ├── index.css                 # Tailwind imports and CSS custom properties
│   └── main.jsx                  # React DOM entry point
│
├── charter-ai-backend/           # Python FastAPI service (flat structure, no packages)
│   ├── main.py                   # FastAPI app, CORS, endpoint definitions
│   ├── recommend.py              # Orchestrator: assembles full recommendation response
│   ├── rules.py                  # Port feasibility engine (draft, LOA, beam validation)
│   ├── cost.py                   # Multi-factor voyage cost estimator
│   ├── forecast.py               # ARIMA + XGBoost freight rate forecasting
│   ├── routes.py                 # Sea distance lookup and Haversine estimation
│   ├── rates_loader.py           # CSV rate data loader and preprocessor
│   ├── ingest_rates.py           # Historical BPI data ingest pipeline
│   ├── validation_suite.py       # Comprehensive 73-point system validation framework
│   ├── validation_report.md      # Auto-generated validation evaluation report
│   ├── ablation_runner.py        # Feature ablation suite (lag, rolling, ARIMA, XGBoost)
│   ├── ablation_report.md        # Feature ablation experimental report
│   ├── sensitivity_runner.py     # Parameter sensitivity & arc elasticity analysis
│   ├── sensitivity_report.md     # Parameter sensitivity evaluation report
│   ├── contract.json             # API contract schema (single source of truth)
│   ├── contract_validator.py     # Runtime contract validation utilities
│   ├── validate_contract.py      # Standalone contract invariant checker
│   ├── check_data.py             # Data integrity checker for ports/vessels JSON
│   ├── verify_api_checks.py      # End-to-end API response verifier
│   ├── ports.json                # Port bathymetric database
│   ├── vessels.json              # Vessel fleet specifications
│   ├── routes.json               # Sea distance overrides
│   ├── rates.csv                 # Processed BPI rate time-series
│   ├── rates_raw.csv             # Raw historical Baltic Panamax Index data
│   ├── requirements.txt          # Python dependencies
│   └── test_*.py                 # pytest test files (7 files, 40 tests total)
│
├── index.html                    # Vite HTML entry point
├── vite.config.js                # Vite configuration with React and Tailwind plugins
├── package.json                  # Node dependencies and scripts
├── DEMO.md                       # 5-minute walkthrough guide
└── demo_scenarios.json           # Pre-configured test scenarios
```

---

## Dashboard Pages

### 1. Overview / Decision Dashboard
The home page. Displays the **hero recommendation card** (recommended vessel, charter timing, expected cost), five KPI cards (freight rate, voyage days, waiting days, savings, confidence), an embedded mini freight forecast chart, a ranked candidate vessel strip, a "Why this vessel?" rationale card, and an alerts feed. The primary "Charter Now" CTA triggers the confirmation modal.

### 2. Voyage & Cargo Specifications (Vessel & Route)
Interactive input panel where users configure the cargo query: commodity type, tonnage, origin port, discharge port, laycan dates, and commercial assumptions. Includes a **"Run Model"** button that sends custom parameters to the backend. Below the inputs: vessel feasibility cards (4 vessel classes with draft/LOA/beam pass/fail), an interactive Leaflet route map, and side-by-side loading/discharge port constraint panels with suitability tables.

### 3. Compare Fleet
Three standardized vessel cards (Panamax, Supramax, Handysize) displayed side-by-side for direct comparison. Each card shows capacity, draft, voyage days, waiting days, cost breakdown, freight rate, confidence score, and feasibility status. The recommended pick is highlighted with an orange border.

### 4. Freight Rate Forecast
A full-width SVG chart rendering a 45-day timeline: historical spot rates (solid teal), 14-day forecast trajectory (dashed orange), 95% confidence interval band, BPI benchmark overlay, and an optimal charter window shading. Date labels are staggered vertically to prevent overlap. Three stat callouts below: current market rate, projected trough rate, and expected change percentage.

### 5. Cost Analysis
Itemized cost breakdown for the recommended vessel (freight, demurrage, bunker fuel, port/canal/misc) with a visual stacked bar and INR/USD currency toggle. A cross-fleet comparison matrix shows costs for Panamax vs. Supramax vs. Handysize with the optimal advantage column. Port waiting time and demurrage impact are explicitly broken out.

### 6. Risk & Scenario Analysis
Four discrete risk factors (market volatility, port congestion, forecast uncertainty, vessel availability) each scored with severity levels. Three outcome scenarios (best, expected, worst case) with cost ranges. A confidence telemetry gauge displaying the model's overall confidence score with feature attribution weights.

### 7. Settings
Commercial assumptions editor (currency, FX rate, demurrage rate per day, bunker price index). ML model backend telemetry panel showing API health status, active data source mode, and a raw JSON payload preview.

---

## Backend Modules

| Module | Responsibility |
|---|---|
| `main.py` | FastAPI app setup, CORS, all endpoint handlers |
| `recommend.py` | Top-level orchestrator — calls rules, cost, forecast, routes; assembles the full recommendation payload conforming to `contract.json` |
| `rules.py` | Port feasibility engine — validates vessel draft, LOA, beam against loading and discharge port bathymetric envelopes; generates feasibility reasons and badge labels |
| `cost.py` | Voyage cost estimator — computes freight, bunker fuel, demurrage, port charges, canal fees; handles USD-to-INR conversion, cargo splitting for oversized lots |
| `forecast.py` | Freight rate forecasting — fits ARIMA(2,1,2) on historical rate data, blends with XGBoost ensemble predictions, generates 14-day trajectory with 95% CI bands, identifies optimal charter trough window |
| `routes.py` | Sea distance lookup — checks `routes.json` for known overrides, falls back to Haversine great-circle estimation |
| `rates_loader.py` | Loads and preprocesses `rates.csv` historical rate data |
| `contract_validator.py` | Runtime validation utilities for checking API responses against contract invariants |
| `validate_contract.py` | Standalone invariant checker: sorted time-series, single recommended vessel, cost sum consistency, confidence bounds, band ordering |
| `check_data.py` | Data integrity checker for `ports.json` and `vessels.json` (duplicate IDs, missing fields) |

---

## REST API Reference

Base URL: `http://localhost:8000`

### POST `/api/v1/charter/recommend`

Primary recommendation endpoint. Accepts cargo requirements and returns the full decision payload.

**Request body:**
```json
{
  "cargoType": "Coking Coal",
  "cargoQuantityMT": 50000,
  "originPortId": "hay-point",
  "destinationPortId": "paradip",
  "targetArrivalDate": "2026-07-15",
  "laycanWindowDays": 5,
  "assumptions": {
    "bunkerPriceUSD": 520,
    "demurrageRateUSD": 12500,
    "fxRate": 83.5
  }
}
```

**Response:** Full recommendation object including `heroDecision`, `candidateVessels[]`, `portConstraints`, `freightForecast`, `costAnalysis`, `riskFactors[]`, and `kpis`. Schema defined in `contract.json`.

### GET `/api/v1/ports`

Returns all ports with bathymetric specifications.

### GET `/api/v1/vessels`

Returns all vessel classes with dimensions and operating parameters.

### GET `/api/v1/routes`

Returns sea distance overrides for configured port pairs.

### GET `/health`

Health check — returns `{ "status": "ok", "dataSource": "synthetic", "latestRateDate": "..." }`.

---

## Model Evaluation & Validation

Navitix includes a comprehensive evaluation harness covering system invariants, feature ablation experiments, and parameter sensitivity audits:

### 1. System Validation Suite (`validation_suite.py`)
- **Coverage**: Executes 73 multi-layer checks across Data Integrity (V1), Port Feasibility Rules (V2), Cost Engine Invariants (V3), Recommendation Ranking (V4), Forecast Quality (V5), Contract Schema Compliance (V6), and Multi-Route Architecture Generalization (V7).
- **Results**: **71/73 Passing (97.3%)** — 0 Failures, 2 Soft Warnings. Confirms zero lookahead leakage, strict cost conservation, and non-empty rationale outputs.
- **Report**: [`validation_report.md`](charter-ai-backend/validation_report.md)

### 2. Feature Ablation Harness (`ablation_runner.py`)
- **Coverage**: Systematically isolates predictive components across 6 experimental ablation runs (Full Model, No Lags, No Rolling Means, Naive Baseline, ARIMA Baseline, XGBoost Only).
- **Key Finding**: Short-term lag (`lag_1`, `lag_7`) and rolling statistics (`rolling_mean_7`) reduce forecast error by **34%** compared to naive carry-forward (XGBoost 8.06% MAPE vs. Naive 12.21% MAPE).
- **Report**: [`ablation_report.md`](charter-ai-backend/ablation_report.md)

### 3. Parameter Sensitivity & Arc Elasticity (`sensitivity_runner.py`)
- **Coverage**: Sweeps 27 parameter variations across USD/INR exchange rate, demurrage rates, bunker fuel prices, and cargo tonnage.
- **Key Finding**: Commercial parameters (FX, fuel, demurrage) scale predictably with arc elasticity $|E| \le 1.0$ and **never switch vessel selection**. Cargo tonnage is the single decision-threshold risk factor.
- **Report**: [`sensitivity_report.md`](charter-ai-backend/sensitivity_report.md)

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.11+ with **pip**

### 1. Backend Setup

```bash
cd charter-ai-backend

# Create and activate virtual environment
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests (33 tests)
pytest -q

# Start the API server
uvicorn main:app --port 8000 --reload
```

### 2. Frontend Setup

```bash
# From project root:
npm install
npm run dev
```

### 3. Open the Dashboard

Navigate to **http://localhost:5173/** in your browser.

The dashboard automatically detects the running backend and switches from **MOCK DATA** mode to **LIVE MODEL** telemetry. The header indicator shows the active mode.

### Available npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Start Vite dev server with HMR |
| `build` | `npm run build` | Production build to `dist/` |
| `preview` | `npm run preview` | Preview production build locally |
| `lint` | `npm run lint` | Run OxLint on source files |

---

## Testing & Evaluation Suites

### 1. Pytest Unit & Integration Tests

```bash
cd charter-ai-backend
.venv\Scripts\Activate.ps1   # or source .venv/bin/activate
pytest -v
```

**40 tests** across 7 test files (100% pass rate):

| Test File | Coverage |
|---|---|
| `test_main.py` | API endpoints (health, ports, vessels, routes, recommend) |
| `test_recommend.py` | Recommendation orchestrator (primary route, badges, no-feasible exception, contract type recommendation) |
| `test_rules.py` | Feasibility engine (draft estimation, vessel screening, draft comparison) |
| `test_routes.py` | Sea distance lookup (overrides, Haversine fallback, unknown port handling) |
| `test_contract_validator.py` | Contract validation (schema checks, invariants) |
| `test_validate_contract.py` | Standalone invariant checks (cost sums, time-series ordering, band bounds) |
| `test_check_data.py` | Data integrity (clean data, duplicate detection, missing fields) |

### 2. Validation & Evaluation Harnesses

```bash
cd charter-ai-backend

# Run 73-point validation suite across data, rules, cost, forecast, and multi-route generalization
python validation_suite.py

# Run 6-experiment feature ablation suite
python ablation_runner.py

# Run 27-point parameter sensitivity & arc elasticity analysis
python sensitivity_runner.py
```

### 3. Frontend Build & Lint Verification

```bash
npm run build   # Ensures zero compilation errors
npm run lint    # OxLint static analysis
```

---

## Design System

The UI follows a **"Dark Maritime Command Center"** visual language with glassmorphic translucent panels and a signal-color hierarchy.

### Color Palette

| Role | Hex | Usage |
|---|---|---|
| Canvas | `#071014` | Primary app background |
| Inset | `#0D1A20` | Sidebar, card insets |
| Card | `#16262D` | Glassmorphic panels (88% opacity) |
| Elevated | `#20343C` | Highlighted containers |
| Border | `#30454D` | 1px HUD borders |
| Primary Text | `#DCE5E7` | Body text and headers |
| Secondary Text | `#82949A` | Captions and labels |
| **Accent** | **`#F47B3A`** | **Active selections, recommended vessel, primary CTAs** |
| Success | `#4FA69A` | Compliant metrics, favorable trends |
| Warning | `#D9A441` | Caution indicators, congestion |
| Danger | `#D9573F` | Draft restrictions, infeasible vessels |

### Typography

| Use | Font | Style |
|---|---|---|
| HUD headings, nav labels, section titles | Space Grotesk | Uppercase, letter-spaced |
| Body text, descriptions | Inter | Regular weight |
| Numbers, KPIs, coordinates, timestamps | JetBrains Mono | Tabular numeric alignment |

---

## Data Provenance

This is a **2-day SIH prototype**. Data sourcing:

| Data | Source | Label |
|---|---|---|
| Port bathymetric limits (draft, LOA, beam) | Indian Ports Association, port authority publications | Real (indicative) |
| Vessel class dimensions and DWT ranges | Industry-standard bulk carrier classifications | Real |
| Sea distances (Hay Point-Paradip, etc.) | Maritime distance databases, Haversine estimation | Real / Estimated |
| Freight rate history (`rates.csv`) | Synthetically generated to match BPI patterns | **Synthetic** |
| Cost assumptions (bunker prices, demurrage, FX) | Industry ranges, user-adjustable in Settings | **Assumption** |
| ML model weights | Fit on synthetic data at runtime | **Synthetic** |

See [`DEMO.md`](DEMO.md) and [`demo_scenarios.json`](demo_scenarios.json) for a 5-minute interactive walkthrough with pre-configured test scenarios.

---

## License

MIT
