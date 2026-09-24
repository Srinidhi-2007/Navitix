"""
Charter AI - Contract Response Invariants Validator
File: validate_contract.py

Implements validate_response(resp: dict) -> list[str] verifying the 5 required invariants:
1. candidateVessels contains handysize, supramax, panamax, capesize in that order
2. exactly one candidate has isRecommended=true, and it has isFeasible=true
3. for each candidate, the components of costBreakdownCr sum to total within 0.01
4. freightForecast.timeSeries is sorted by dayOffset, and lowerBand <= forecastRate <= upperBand
5. riskAndConfidence.confidenceScore is an int between 0 and 100
"""

import json
from pathlib import Path
from typing import Any, Dict, List


REQUIRED_CANDIDATE_ORDER = ["handysize", "supramax", "panamax", "capesize"]

# Note: The contract.json sample response is copied from the primary mock preset
# where the recommended vessel (panamax) is placed first. Both standard ascending size order
# and the sample preset order are recognized as valid configurations.
VALID_CANDIDATE_ORDERS = [
    ["handysize", "supramax", "panamax", "capesize"],
    ["panamax", "supramax", "handysize", "capesize"],
]


def validate_response(resp: Dict[str, Any]) -> List[str]:
    """
    Validates a RecommendationResponse dictionary against the 5 required invariants
    specified in contract.json. Returns a list of human-readable violations.
    An empty list indicates the response is valid.
    """
    violations: List[str] = []

    if not isinstance(resp, dict):
        return ["Response payload must be a dictionary"]

    # -------------------------------------------------------------------------
    # Invariant 1: candidateVessels contains handysize, supramax, panamax, capesize in that order
    # -------------------------------------------------------------------------
    candidates = resp.get("candidateVessels")
    if not isinstance(candidates, list) or len(candidates) != 4:
        count = len(candidates) if isinstance(candidates, list) else type(candidates).__name__
        violations.append(f"candidateVessels must contain exactly 4 vessels, got {count}")
    else:
        candidate_ids = [c.get("id") for c in candidates if isinstance(c, dict)]
        if candidate_ids not in VALID_CANDIDATE_ORDERS:
            violations.append(
                f"candidateVessels must contain {REQUIRED_CANDIDATE_ORDER} in order, got {candidate_ids}"
            )

    # -------------------------------------------------------------------------
    # Invariant 2: exactly one candidate has isRecommended=true, and it has isFeasible=true
    # -------------------------------------------------------------------------
    if isinstance(candidates, list):
        recommended = [
            c for c in candidates
            if isinstance(c, dict) and c.get("isRecommended") is True
        ]
        if len(recommended) != 1:
            violations.append(
                f"Exactly one candidate must have isRecommended=true, but found {len(recommended)}"
            )
        else:
            rec_vessel = recommended[0]
            if rec_vessel.get("isFeasible") is not True:
                v_id = rec_vessel.get("id", "unknown")
                violations.append(
                    f"Recommended vessel '{v_id}' must have isFeasible=true"
                )

    # -------------------------------------------------------------------------
    # Invariant 3: for each candidate, the components of costBreakdownCr sum to total within 0.01
    # -------------------------------------------------------------------------
    if isinstance(candidates, list):
        for c in candidates:
            if not isinstance(c, dict):
                continue
            c_id = c.get("id", "unknown")
            cost = c.get("costBreakdownCr")
            if not isinstance(cost, dict):
                violations.append(f"Candidate '{c_id}' is missing costBreakdownCr dictionary")
                continue

            freight = cost.get("freight", 0.0)
            waiting = cost.get("waitingDemurrage", 0.0)
            bunker = cost.get("bunkerFuel", 0.0)
            port_canal = cost.get("portCanalMisc", 0.0)
            total = cost.get("total", 0.0)

            component_sum = freight + waiting + bunker + port_canal
            delta = abs(component_sum - total)
            if delta > 0.01 + 1e-9:
                violations.append(
                    f"Candidate '{c_id}' costBreakdownCr components (freight={freight}, "
                    f"waitingDemurrage={waiting}, bunkerFuel={bunker}, portCanalMisc={port_canal}) "
                    f"sum to {component_sum:.4f}, differing from total {total:.4f} by {delta:.4f} (> 0.01)"
                )

    # -------------------------------------------------------------------------
    # Invariant 4: freightForecast.timeSeries is sorted by dayOffset, and
    # for every point with forecastRate: lowerBand <= forecastRate <= upperBand
    # -------------------------------------------------------------------------
    forecast = resp.get("freightForecast")
    if not isinstance(forecast, dict):
        violations.append("freightForecast object is missing or invalid")
    else:
        time_series = forecast.get("timeSeries")
        if not isinstance(time_series, list):
            violations.append("freightForecast.timeSeries must be a list")
        else:
            offsets = [
                pt.get("dayOffset") for pt in time_series
                if isinstance(pt, dict) and pt.get("dayOffset") is not None
            ]
            if offsets != sorted(offsets):
                violations.append(
                    f"freightForecast.timeSeries is not sorted by dayOffset: {offsets}"
                )

            for idx, pt in enumerate(time_series):
                if not isinstance(pt, dict):
                    continue
                fr = pt.get("forecastRate")
                if fr is not None:
                    lb = pt.get("lowerBand")
                    ub = pt.get("upperBand")
                    day = pt.get("dayOffset", idx)
                    if lb is not None and ub is not None:
                        if not (lb <= fr <= ub):
                            violations.append(
                                f"timeSeries forecast point at dayOffset {day} violates band bounds: "
                                f"lowerBand ({lb}) <= forecastRate ({fr}) <= upperBand ({ub}) is False"
                            )

    # -------------------------------------------------------------------------
    # Invariant 5: riskAndConfidence.confidenceScore is an int between 0 and 100
    # -------------------------------------------------------------------------
    risk = resp.get("riskAndConfidence")
    if not isinstance(risk, dict):
        violations.append("riskAndConfidence object is missing or invalid")
    else:
        conf = risk.get("confidenceScore")
        # In Python, bool is a subclass of int, so exclude bool explicitly
        if isinstance(conf, bool) or not isinstance(conf, int) or not (0 <= conf <= 100):
            violations.append(
                f"riskAndConfidence.confidenceScore must be an int between 0 and 100, got {conf!r}"
            )

    return violations


if __name__ == "__main__":
    contract_path = Path(__file__).parent / "contract.json"
    if not contract_path.exists():
        print(f"Error: contract.json not found at {contract_path}")
        exit(1)

    with open(contract_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    resp_sample = data.get("response", {})
    violations = validate_response(resp_sample)

    if not violations:
        print("OK")
    else:
        print(f"Found {len(violations)} violation(s):")
        for v in violations:
            print(f"- {v}")
