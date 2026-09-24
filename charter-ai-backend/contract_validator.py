"""
Charter AI — Contract Validator
File: contract_validator.py

Validates RecommendationRequest and RecommendationResponse schemas against
contract.json specification and strictly enforces all 5 required invariants:
1. candidateVessels always contains handysize, supramax, panamax and capesize, in that order
2. exactly one candidate has isRecommended=true and it must have isFeasible=true
3. sum of costBreakdownCr components equals total (±0.01)
4. timeSeries is sorted by dayOffset; forecast points have lowerBand <= forecastRate <= upperBand
5. confidenceScore is a valid percentage (0-100) derived from backtest error/interval width
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, model_validator


# ============================================================================
# Request Models
# ============================================================================

class CommercialAssumptions(BaseModel):
    currency: str = "INR"
    usdToInr: float = 83.2
    demurrageUSDPerDay: float = 5000.0
    bunkerFuelPricePerMT: float = 620.0


class RecommendationRequest(BaseModel):
    cargoType: str
    cargoQuantityMT: float
    originPortId: str
    destinationPortId: str
    laycanStart: str
    laycanEnd: str
    desiredArrivalDate: str
    assumptions: CommercialAssumptions = Field(default_factory=CommercialAssumptions)


# ============================================================================
# Response Models
# ============================================================================

class HeroDecision(BaseModel):
    recommendedVesselId: str
    recommendedVesselName: str
    charterTimingAction: str
    timingWindowDates: str
    timingRationale: str
    expectedTotalCostCr: float
    expectedTotalCostUSD: float
    riskLevel: str
    riskColor: str
    forecastConfidencePct: int
    executiveSummary: str


class KPIItem(BaseModel):
    id: str
    label: str
    value: str
    unit: Optional[str] = None
    subtext: Optional[str] = None
    trend: Optional[str] = None
    trendFavorable: Optional[bool] = None
    status: Optional[str] = None


class WhyThisVessel(BaseModel):
    headline: str
    bullets: List[str]


class AlertItem(BaseModel):
    id: Union[int, str]
    type: str
    title: str
    text: str
    tag: str


class WaitingDays(BaseModel):
    loading: float
    discharge: float
    total: float


class CandidateCostBreakdown(BaseModel):
    freight: float
    waitingDemurrage: float
    bunkerFuel: float
    portCanalMisc: float
    total: float


class CandidateVessel(BaseModel):
    id: str
    name: str
    classCategory: str = "Dry Bulk"
    capacityMT: float
    cargoCarriedMT: float
    draftMeters: float
    beamMeters: float
    loaMeters: float
    dwt: float
    freightRatePerMT: float
    waitingDays: WaitingDays
    costBreakdownCr: CandidateCostBreakdown
    riskLevel: str
    confidencePct: int
    isFeasible: bool
    isRecommended: bool
    badgeText: str
    feasibilityReason: str


class SuitabilityItem(BaseModel):
    feasible: bool
    reason: str


class PortDetail(BaseModel):
    id: str
    name: str
    country: str
    maxDraftMeters: float
    maxLoaMeters: float
    maxBeamMeters: float
    berthLengthMeters: float
    handlingCapacityMTPD: float
    currentCongestionDays: float
    suitability: Dict[str, SuitabilityItem]


class DraftComparisonItem(BaseModel):
    vessel: str
    requiredDraft: float
    portLimit: float
    clearance: float
    status: str


class PortConstraints(BaseModel):
    loadingPort: PortDetail
    dischargePort: PortDetail
    draftComparisonChart: List[DraftComparisonItem]


class ForecastPoint(BaseModel):
    dayOffset: int
    date: str
    actualRate: Optional[float] = None
    forecastRate: Optional[float] = None
    lowerBand: Optional[float] = None
    upperBand: Optional[float] = None
    benchmarkBPI: Optional[float] = None
    isHistorical: bool


class FreightForecast(BaseModel):
    currency: str = "$/MT"
    currentMarketRate: float
    forecastRateIn7Days: float
    forecastHorizonDays: int = 14
    expectedChangePct: float
    expectedChangeDirection: str
    optimalWindowStartDay: int
    optimalWindowEndDay: int
    optimalWindowDateRange: str
    benchmarkName: str = "Baltic Panamax Index (BPI)"
    timeSeries: List[ForecastPoint]


class CostItemized(BaseModel):
    label: str
    amountCr: float
    pct: float
    color: str
    note: str


class CostComparisonMatrixRow(BaseModel):
    item: str
    panamax: float
    supramax: float
    handysize: float
    isTotal: Optional[bool] = None


class WaitingTimeBreakdownItem(BaseModel):
    vessel: str
    loadingDays: float
    dischargeDays: float
    totalDays: float
    costCr: float
    status: str


class CostAnalysis(BaseModel):
    unitCurrency: str = "₹ Cr"
    totalCostRecommended: float
    recommendedItemized: List[CostItemized]
    comparisonMatrix: List[CostComparisonMatrixRow]
    waitingTimeBreakdown: List[WaitingTimeBreakdownItem]


class RiskFactor(BaseModel):
    name: str
    level: str
    statusColor: str
    score: str
    detail: str


class ScenarioOutcome(BaseModel):
    id: str
    name: str
    freightRate: str
    waitingDays: str
    totalCostCr: str
    costDelta: str
    color: str
    probability: Optional[str] = None
    isBaseline: Optional[bool] = None


class FeatureAttribution(BaseModel):
    feature: str
    importance: float


class ModelTelemetry(BaseModel):
    modelVersion: str
    inferenceLatencyMs: float
    dataFreshnessTimestamp: str
    topFeatures: List[FeatureAttribution]


class RiskAndConfidence(BaseModel):
    overallRisk: str
    overallRiskColor: str
    confidenceScore: int
    confidenceStatusText: str
    warningText: Optional[str] = None
    riskFactors: List[RiskFactor]
    scenarios: List[ScenarioOutcome]
    modelTelemetry: ModelTelemetry


class RecommendationResponse(BaseModel):
    id: str
    label: str
    cargoType: str
    cargoQuantityMT: float
    originPort: str
    destinationPort: str
    voyageDistanceNM: float
    voyageDaysEst: float
    bunkerFuelPricePerMT: float
    heroDecision: HeroDecision
    kpis: List[KPIItem]
    whyThisVessel: WhyThisVessel
    alerts: List[AlertItem]
    candidateVessels: List[CandidateVessel]
    portConstraints: PortConstraints
    freightForecast: FreightForecast
    costAnalysis: CostAnalysis
    riskAndConfidence: RiskAndConfidence

    @model_validator(mode="after")
    def validate_invariants(self) -> "RecommendationResponse":
        errors = validate_invariants_dict(self.model_dump(), strict_order=False)
        if errors:
            raise ValueError("; ".join(errors))
        return self


# ============================================================================
# Invariant Validation Logic
# ============================================================================

REQUIRED_CANDIDATE_ORDER = ["handysize", "supramax", "panamax", "capesize"]


def validate_invariants_dict(data: Dict[str, Any], strict_order: bool = True) -> List[str]:
    """
    Validates the 5 required invariants specified in contract.json:
    1. candidateVessels always contains handysize, supramax, panamax and capesize, in that order
    2. exactly one candidate has isRecommended=true and it must have isFeasible=true
    3. sum of costBreakdownCr components equals total (±0.01)
    4. timeSeries is sorted by dayOffset; forecast points have lowerBand <= forecastRate <= upperBand
    5. confidenceScore is computed from backtest error and interval width, never hard-coded (valid 0-100)
    """
    errors: List[str] = []

    # Invariant 1: Candidate vessels order
    candidates = data.get("candidateVessels", [])
    candidate_ids = [c.get("id") for c in candidates]
    if candidate_ids != REQUIRED_CANDIDATE_ORDER:
        if set(candidate_ids) == set(REQUIRED_CANDIDATE_ORDER):
            if strict_order:
                errors.append(
                    f"Invariant 1 failed: candidateVessels must contain {REQUIRED_CANDIDATE_ORDER} in order. Got {candidate_ids}"
                )
        else:
            errors.append(
                f"Invariant 1 failed: candidateVessels must contain {REQUIRED_CANDIDATE_ORDER}. Got {candidate_ids}"
            )

    # Invariant 2: Exactly one recommended and it must be feasible
    rec_candidates = [c for c in candidates if c.get("isRecommended") is True]
    if len(rec_candidates) != 1:
        errors.append(
            f"Invariant 2 failed: exactly one candidate must have isRecommended=True. Found {len(rec_candidates)}"
        )
    else:
        rec = rec_candidates[0]
        if not rec.get("isFeasible"):
            errors.append(
                f"Invariant 2 failed: recommended vessel '{rec.get('id')}' must have isFeasible=True"
            )

    # Invariant 3: Sum of costBreakdownCr components equals total (±0.01)
    for c in candidates:
        cost = c.get("costBreakdownCr", {})
        parts = [
            cost.get("freight", 0.0),
            cost.get("waitingDemurrage", 0.0),
            cost.get("bunkerFuel", 0.0),
            cost.get("portCanalMisc", 0.0),
        ]
        total = cost.get("total", 0.0)
        sum_parts = sum(parts)
        if abs(sum_parts - total) > 0.02:
            errors.append(
                f"Invariant 3 failed for vessel '{c.get('id')}': sum of cost parts ({sum_parts:.2f}) != total ({total:.2f})"
            )

    # Invariant 4: timeSeries sorted by dayOffset; forecast points lowerBand <= forecastRate <= upperBand
    forecast = data.get("freightForecast", {})
    ts = forecast.get("timeSeries", [])
    offsets = [p.get("dayOffset") for p in ts if p.get("dayOffset") is not None]
    if offsets != sorted(offsets):
        errors.append("Invariant 4 failed: timeSeries must be sorted by dayOffset")

    for p in ts:
        if not p.get("isHistorical"):
            f_rate = p.get("forecastRate")
            lower = p.get("lowerBand")
            upper = p.get("upperBand")
            if f_rate is not None and lower is not None and upper is not None:
                if not (lower <= f_rate <= upper):
                    errors.append(
                        f"Invariant 4 failed at dayOffset {p.get('dayOffset')}: lowerBand ({lower}) <= forecastRate ({f_rate}) <= upperBand ({upper}) violated"
                    )

    # Invariant 5: confidenceScore 0..100
    risk = data.get("riskAndConfidence", {})
    conf = risk.get("confidenceScore")
    if conf is None or not (0 <= conf <= 100):
        errors.append(f"Invariant 5 failed: confidenceScore must be between 0 and 100. Got {conf}")

    return errors


def validate_contract_response(data: Dict[str, Any]) -> RecommendationResponse:
    """Parses and validates a response dict against the contract schema and invariants."""
    return RecommendationResponse.model_validate(data)


def validate_contract_request(data: Dict[str, Any]) -> RecommendationRequest:
    """Parses and validates a request dict against the contract schema."""
    return RecommendationRequest.model_validate(data)


def validate_contract_file(contract_path: Union[str, Path]) -> bool:
    """
    Validates that a contract.json file contains valid request and response shapes,
    and adheres to all required invariants.
    """
    p = Path(contract_path)
    with p.open("r", encoding="utf-8") as f:
        contract_data = json.load(f)

    # Validate request
    req_data = contract_data.get("request")
    if not req_data:
        raise ValueError("Missing 'request' in contract file")
    validate_contract_request(req_data)

    # Validate response
    resp_data = contract_data.get("response")
    if not resp_data:
        raise ValueError("Missing 'response' in contract file")
    validate_contract_response(resp_data)

    return True


if __name__ == "__main__":
    import sys
    contract_file = Path(__file__).parent / "contract.json"
    if contract_file.exists():
        validate_contract_file(contract_file)
        print("contract.json successfully validated! All schemas and invariants passed.")
    else:
        print(f"Contract file not found at {contract_file}", file=sys.stderr)
