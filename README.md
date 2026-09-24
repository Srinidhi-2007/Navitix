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

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/Srinidhi-2007/charter-ai.git
cd charter-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production preview
npm run build
npm run preview
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

### Backend Setup (FastAPI Service)

#### 1. Navigate to the backend directory
```bash
cd charter-ai-backend
```

#### 2. Create and activate a virtual environment
```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Activate on Windows (Command Prompt):
.venv\Scripts\activate.bat

# Activate on macOS / Linux:
source .venv/bin/activate
```

#### 3. Install dependencies
```bash
pip install -r requirements.txt
```

#### 4. Run tests
```bash
pytest -q
```

#### 5. Run development server (when ready)
```bash
uvicorn main:app --reload --port 8000
```

---

## Future Machine Learning Pipeline Ingestion

All frontend panels consume from a single reactive mock data store located at `src/data/mockData.js`. 

To integrate a live Python/FastAPI/CatBoost/Prophet backend:
1. Deploy your inference endpoint (e.g. `POST /api/v1/charter/recommend`).
2. Pass the JSON schema defined in `src/pages/SettingsPage.jsx`.
3. Replace the static import in `src/App.jsx` with an asynchronous `fetch()` hook. The entire UI will react without any layout changes.
