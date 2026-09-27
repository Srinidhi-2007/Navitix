# Charter AI — Demonstration & Evaluation Guide

> **SIH Problem Statement SIH26006 (Ministry of Steel)**  
> *Intelligent Freight Forecasting & Vessel Chartering Decision Support System for India's East Coast Ports*

---

## 1. Quick Start / Run Commands

### A. Start the Backend Service (FastAPI)
Open a terminal in the repository root:
```powershell
cd charter-ai-backend
.venv\Scripts\uvicorn main:app --port 8000 --reload
```
*Health Check endpoint: [http://localhost:8000/health](http://localhost:8000/health)*

### B. Start the Frontend Dashboard (React + Vite)
Open a second terminal in the repository root:
```powershell
npm run dev
```
*Open dashboard in browser: [http://localhost:5173](http://localhost:5173) (or `http://localhost:5174` if 5173 is busy)*

---

## 2. Real vs Assumed / Synthetic Data Matrix

As per prototype ground rules, all data provenance is explicitly declared:

| Domain / Dimension | Provenance Level | Source / Notes |
| :--- | :--- | :--- |
| **Paradip Port Bathymetry & Constraints** | **REAL** | Official Paradip Port Authority berth limits (Max permissible draft: 14.5m, LOA: 230m, handling rate: 35,000 MT/day). |
| **Vessel Fleet Specifications** | **ASSUMPTION / INDICATIVE** | Standard Baltic bulk carrier dimensional envelopes (Handysize, Supramax, Panamax, Capesize). |
| **Origin & Secondary Ports** | **ASSUMPTION / INDICATIVE** | Standard published parameters for Hay Point (DBCT), Port Hedland, Santos, Qingdao, and Alexandria. |
| **Base Rates & Multipliers** | **ASSUMPTION / INDICATIVE** | Calibrated on benchmark spot freight indexes ($/MT) and standard demurrage ($5,000/day). |
| **Freight Rate Forecast & BPI** | **SYNTHETIC** | Generated via mean-reverting Ornstein-Uhlenbeck stochastic simulation (`seed=42`). Drop in `rates_raw.csv` (`date, value`) to train on live Baltic Panamax Index data. |

---

## 3. 5-Minute Demonstration Click Path

Follow this structured workflow during evaluation or jury review:

```
[Overview] ➔ [Vessel & Route] ➔ [Compare Vessels] ➔ [Cost Analysis] ➔ [Freight Forecast] ➔ [Risk & Telemetry] ➔ [Settings]
```

### Minute 1: Overview & Executive Recommendation (`/`)
1. **Notice the Status Strip**: Confirm `LIVE MODEL ACTIVE` (shows FastAPI latency and model version).
2. **Review Hero Decision Banner**:
   - Optimal Vessel: **Panamax (75,000 DWT)**.
   - Recommended Action: **"Charter in Optimal Window"** (`Sep 12 – Sep 14`).
   - Expected Total Cost: **₹14.22 Cr** (~$1.71M USD).
   - Forecast Confidence: **87%** with 100% feasibility compliance.
3. **Mini-Forecast & KPI Bar**:
   - Inspect the 14-day rate trajectory with optimal window highlight.
   - Check the 5 mission KPIs (Voyage Days, Draft Margin, Carbon Footprint, Rate Savings).

### Minute 2: Vessel & Route Constraints (`/vessel-route`)
1. **Interactive Bathymetric Map**:
   - View the dark-mode geodetic track from **Hay Point (Australia)** to **Paradip (India)**.
   - Click the **Paradip Port** marker to inspect the live 14.5m draft guardrail.
2. **Draft Feasibility Spectrum**:
   - Compare vessel laden drafts: Handysize (10.2m PASS), Supramax (12.8m PASS), Panamax (14.2m PASS), **Capesize (18.2m FAIL - EXCEEDED by 3.7m)**.
3. **Trigger Quick Scenarios**:
   - Click the **Port Hedland → Qingdao (70,000 MT)** preset button: observe automatic re-evaluation where Capesize becomes feasible due to Qingdao's 20.0m deep-water channel.
   - Click the **Hay Point → Paradip** preset button to return to baseline.

### Minute 3: Fleet Benchmarking & Cost Analysis (`/compare-vessels` & `/cost-analysis`)
1. **Navigate to Compare Vessels**:
   - Observe side-by-side technical and financial breakdown across candidates.
   - Note the Capesize exclusion banner explaining physical restriction at Paradip.
2. **Navigate to Cost Analysis**:
   - Toggle currency between **₹ CRORES (INR)** and **$ MILLIONS (USD)**.
   - Inspect the itemized cost composition bar (Freight: ₹11.95 Cr, Fuel: ₹0.93 Cr, Port Waiting & Demurrage: ₹1.34 Cr).
   - Review the **Port Waiting & Demurrage Analysis** showing distinct loading wait (Hay Point) and discharge berth line-up delays (Paradip).

### Minute 4: Freight Forecasting Engine (`/freight-forecast`)
1. **Predictive Rate Trajectory**:
   - Hover over chart data points to inspect spot fixture history and 14-day projection.
   - Toggle the **Confidence Band (95% CI)** and **BPI Benchmark** overlays.
   - Observe the predicted market trough at Day +4 ($27.90/MT vs $28.50/MT prompt spot), highlighting an estimated **$75,000 USD savings window**.
2. **Execute Charter CTA**:
   - Click **"EXECUTE AT TROUGH RATE"** to open the interactive Charter Execution Modal.

### Minute 5: Stress-Testing & Data Provenance (`/settings` & Multi-Voyage Stress Test)
1. **Test 150,000 MT Mega-Parcel Stress Case**:
   - Return to **Vessel & Route** page and change **Cargo Quantity** from `50,000` to `150,000` MT.
   - Watch the backend automatically compute a **2x Panamax multi-voyage split**, maintaining strict compliance with Paradip's 14.5m bathymetry limit while excluding oversized Capesize.
2. **Navigate to Settings & Model Telemetry**:
   - Click **"TEST CONNECTION"**: validates live `/health` status and flags synthetic data provenance with an amber safety indicator.
   - Switch between **REQUEST JSON** and **RESPONSE JSON** in the live contract inspector to review real-time schema compliance.
3. **Simulate Offline Resilience**:
   - Stop the backend process: watch the dashboard status strip smoothly transition to **`DEMO DATA MODE`** with zero runtime crashes or missing fields.

---

## 4. Test Suite Execution

Run automated unit and contract compliance tests anytime:
```powershell
cd charter-ai-backend
.venv\Scripts\pytest -v
```
*Current test suite status: **33 passed** (covers route math, port bathymetry rules, contract validation, and FastAPI routes).*
