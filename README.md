# ⚓ Charter AI — Maritime Vessel Chartering Decision Dashboard

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F47B3A.svg)](https://opensource.org/licenses/MIT)

**Charter AI** is a high-fidelity decision-support prototype dashboard for maritime vessel chartering. It equips chartering managers and bulk commodity traders to answer the core operational question:

> **"Given this cargo requirement and route, what vessel should I charter, when should I charter it, and what will it likely cost?"**

---

## 🎨 Visual Design System: "Dark Maritime Command Center"

The UI is built on a dark naval telemetry design system with glassmorphic translucent panels and signal color hierarchy:

| Element | Color | Hex | Purpose |
|---|---|---|---|
| Main Background | Near-black navy | `#071014` | Primary app canvas |
| Secondary Background | Deep navy | `#0D1A20` | Sidebar & inset backgrounds |
| Cards / Panels | Slate navy | `#16262D` | Translucent glassmorphic cards (88% opacity) |
| Elevated Panels | Blue-gray | `#20343C` | Highlighted containers |
| Borders | Muted steel | `#30454D` | 1px clean HUD borders |
| Primary Text | Off-white | `#DCE5E7` | Body and headers |
| Secondary Text | Cool gray | `#82949A` | Subtext and captions |
| **Primary Accent** | **Amber Orange** | **`#F47B3A`** | **Active selections, winner card, primary CTAs** |
| Success Signal | Muted teal | `#4FA69A` | Compliant metrics, favorable trends |
| Warning Signal | Amber | `#D9A441` | Cautions, congestion delays |
| Danger / Excluded | Red-orange | `#D9573F` | Draft restrictions, unfeasible vessels |

### Typography Hierarchy
- **HUD Headings, Nav Labels, Section Titles**: `Space Grotesk` (uppercase, letter-spaced)
- **Body & Descriptions**: `Inter`
- **Numeric Figures, Timestamps, Coordinates, KPIs**: `JetBrains Mono` (tabular numeric alignment)

---

## 🗺 System Architecture (3 Layers)

1. **Input Layer**: Cargo commodity, tonnage (e.g. 50,000 MT Coking Coal), loading port, discharge port, arrival date, and laycan allowances.
2. **Analysis Layer**: Port bathymetric draft envelopes, candidate fleet feasibility checks, 14-day predicted freight trajectory, port waiting demurrage, and multi-factor risk auditing.
3. **Decision Layer**: Recommended vessel pick (Panamax), charter timing window (*"Charter within 3–5 days"*), expected total cost (₹14.22 Cr), and model confidence score (87%).

---

##  Modules & Pages

```
CHARTER AI
├── Overview / Decision Dashboard (Home)
│   ├── Hero recommendation card (Panamax, timing action, expected cost)
│   ├── 5 KPI HUD readout cards
│   ├── Embedded freight forecast mini-chart
│   ├── Candidate vessel comparison strip
│   ├── "Why this vessel?" executive rationale card
│   ├── Alerts & insights live feed
│   └── "CHARTER NOW" primary CTA modal trigger
│
├── Vessel & Route + Port Constraints
│   ├── Interactive voyage & laycan input section
│   ├── 4-vessel feasibility check with draft limitation explanations
│   ├── Side-by-side loading port & discharge port constraint cards
│   └── Port draft feasibility spectrum comparative bar chart
│
├── Freight Forecast
│   ├── 45-day continuous timeline chart (historical spot + 14-day predicted)
│   ├── Shaded 95% confidence interval envelope & BPI benchmark
│   ├── Current market rate pin & optimal charter window trough marker
│   └── 3 key stat callouts (Current rate, Trough rate, Expected change)
│
├── Cost Analysis
│   ├── Recommended vessel itemized cost breakdown (Freight, Demurrage, Bunkers, Misc)
│   ├── Stacked visual cost bar with currency switcher (₹ Cr / $ USD)
│   ├── Cross-fleet comparison matrix highlighting Panamax ₹1.35 Cr savings
│   └── Port waiting time breakdown explicitly included in total cost
│
├── Risk & Scenario Analysis + Forecast Confidence
│   ├── Discrete risk factor audit (Volatility, Congestion, Uncertainty, Availability)
│   ├── 3 outcome scenarios (Best Case, Expected Case, Worst Case)
│   ├── Confidence telemetry gauge (87%) with low-confidence guardrails
│   └── Model feature attribution weights
│
├── Compare Vessels
│   ├── 3 side-by-side standardized cards (Panamax, Supramax, Handysize)
│   └── Recommended pick highlighted with an orange border and warm glow
│
└── Settings
    ├── Commercial assumptions (currency, demurrage rate, bunker price index)
    └── Machine learning model API hook simulation & JSON payload preview
```

## 🛠 Tech Stack & Architecture

### Frontend (Dashboard UI)
- **Framework**: React 19 + Vite 5.4
- **Styling**: Tailwind CSS v4 (Vanilla CSS variables + utility classes)
- **Visualizations**: Recharts / Chart.js (Freight trendline, 95% CI band, cost stacked bars, draft spectrum)
- **Geospatial Map**: Leaflet + React-Leaflet (Custom dark tile filter, geodetic route paths, port popups)
- **Icons**: Lucide React
- **Data Layer**: Custom `useRecommendation` hook with live API integration & automatic fallback to `mockData.js`

### Backend (FastAPI Service)
- **Framework**: Python 3.11+ FastAPI + Uvicorn
- **Freight Forecasting**: Statsmodels ARIMA (2,1,2) + XGBoost Ensemble for 14-day rate trajectory with 95% confidence intervals
- **Feasibility Engine**: Port bathymetric envelope validation (Draft, LOA, Beam)
- **Cost Engine**: Multi-factor voyage cost estimator (Freight, Demurrage, Bunker index, USD/INR conversion, lot splitting)
- **Data Validation**: Strict contract validation (`validate_contract.py`) against `contract.json` single source of truth
- **Testing**: `pytest` (33 tests covering routes, feasibility, cost math, contract integrity, and endpoints)

---

## 🛰 REST API Specifications

The dashboard connects to the FastAPI backend service (`http://localhost:8000`).

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/charter/recommend` | `POST` | Primary recommendation orchestrator. Accepts cargo requirements & assumptions; returns winner vessel, timing window, itemized costs, feasibility matrix, 14-day rate forecast, and risk telemetry. |
| `/api/v1/ports` | `GET` | Returns list of loading/discharge ports with bathymetric envelopes (max draft, LOA, beam, gear requirements). |
| `/api/v1/vessels` | `GET` | Returns full vessel fleet database with dimensions, draft, deadweight tonnage (DWT), and daily demurrage rates. |
| `/api/v1/routes` | `GET` | Returns sea distance overrides and pre-configured quick scenarios (e.g., Newcastle -> Paradip). |
| `/health` | `GET` | Health check endpoint returning status, active data source (`synthetic` / `real`), and latest rate data timestamp. |

---

## 🚀 Quick Start Guide

### 1. Start Backend (FastAPI)
```bash
cd charter-ai-backend
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
pytest -q  # Run test suite (33 tests)
uvicorn main:app --port 8000 --reload
```

### 2. Start Frontend (React + Vite)
```bash
# In project root:
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) (or port 5174). The dashboard automatically detects the running backend and displays **`LIVE MODEL`** telemetry mode!

---

## 📑 Demo Scenarios & Data Provenance

See [`DEMO.md`](file:///d:/charterAI/DEMO.md) and [`demo_scenarios.json`](file:///d:/charterAI/demo_scenarios.json) for:
- 5-minute interactive walkthrough path
- Pre-configured test scenarios (Default Coking Coal, Iron Ore to Vizag, Bauxite to Haldia, 150k MT Stress Split)
- Detailed breakdown of **REAL** vs **ASSUMED/SYNTHETIC** data sources (SIH26006 compliance)

