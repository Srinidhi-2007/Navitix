"""
Charter AI — FastAPI Recommendation Service
File: main.py

Endpoints:
- POST /api/v1/charter/recommend : Full vessel recommendation pipeline
- GET  /api/v1/ports            : Port database with envelopes and berths
- GET  /api/v1/vessels          : Vessel specifications and typical envelopes
- GET  /api/v1/routes           : Route distance database and overrides
- GET  /health                  : Service health, data source mode & latest rates date
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from recommend import NoFeasibleVesselError, recommend

BASE_DIR = Path(__file__).parent

app = FastAPI(
    title="Charter AI Recommendation API",
    version="0.1.0-prototype",
    description="Intelligent decision-support system for vessel chartering and bulk cargo procurement.",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Request Models ────────────────────────────────────────────────────────────

class CommercialAssumptions(BaseModel):
    currency: str = "INR"
    usdToInr: float = 83.2
    demurrageUSDPerDay: float = 5000.0
    bunkerFuelPricePerMT: float = 620.0


class RecommendationRequest(BaseModel):
    cargoType: str = "Coking Coal"
    cargoQuantityMT: float = Field(default=50000.0, gt=0, description="Cargo quantity in metric tons (must be positive)")
    originPortId: str = "hay-point"
    destinationPortId: str = "paradip"
    laycanStart: Optional[str] = "2026-09-12"
    laycanEnd: Optional[str] = "2026-09-16"
    desiredArrivalDate: Optional[str] = "2026-09-28"
    assumptions: CommercialAssumptions = Field(default_factory=CommercialAssumptions)


# ── Exception Handlers ────────────────────────────────────────────────────────

@app.exception_handler(NoFeasibleVesselError)
async def no_feasible_vessel_handler(request: Request, exc: NoFeasibleVesselError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": str(exc)},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": str(exc), "field": "originPortId/destinationPortId"},
    )


# ── Static Data Helpers ───────────────────────────────────────────────────────

def _load_data_file(filename: str) -> Dict[str, Any]:
    file_path = BASE_DIR / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": f"Data file {filename} not found on server"},
        )
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/v1/charter/recommend", response_model=Dict[str, Any])
def post_recommendation(payload: RecommendationRequest):
    """
    Evaluates route feasibility, freight forecasts, and voyage economics
    to recommend the optimal vessel charter configuration.
    """
    try:
        req_dict = payload.model_dump()
        result = recommend(req_dict, data_dir=str(BASE_DIR))
        return result
    except NoFeasibleVesselError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": str(exc)})
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(exc), "field": "port/route parameter"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": f"Recommendation pipeline error: {str(exc)}"},
        )


@app.get("/api/v1/ports")
def get_ports():
    """Returns ports database with bathymetric envelopes and berth limits."""
    return _load_data_file("ports.json")


@app.get("/api/v1/vessels")
def get_vessels():
    """Returns vessel type specifications and standard envelopes."""
    return _load_data_file("vessels.json")


@app.get("/api/v1/routes")
def get_routes():
    """Returns route distance database and override matrix."""
    return _load_data_file("routes.json")


@app.get("/health")
def health_check():
    """Returns service health status, data source mode, and last rate date."""
    rates_file = BASE_DIR / "rates.csv"
    data_source = "synthetic"
    last_date = None

    if rates_file.exists():
        try:
            df = pd.read_csv(rates_file)
            if not df.empty:
                last_date = str(df["date"].iloc[-1])
                if "source" in df.columns:
                    data_source = str(df["source"].iloc[-1])
        except Exception:
            pass

    return {
        "status": "ok",
        "dataSource": data_source,
        "ratesLastDate": last_date,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
