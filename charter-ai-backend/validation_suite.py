"""
Charter AI � Validation & Architecture Evaluation Suite
File: validation_suite.py

Validates correctness of all backend logic modules and evaluates the
end-to-end model architecture. Generates validation_report.md.

Sections:
  V1.  Data Integrity          � rates.csv shape, no gaps, no negatives
  V2.  Feature Engineering     � no lookahead, correct lag values, feature count
  V3.  Cost Engine             � cost components sum to total, INR conversion
  V4.  Rules Engine            � feasibility logic, draft limits, vessel ordering
  V5.  Forecast Quality        � backtest metrics, model selection, CI validity
  V6.  Contract Shape          � timeSeries offsets, freightForecast field presence
  V7.  Architecture Evaluation � cross-model comparison, multi-route generalization
"""

import json
import math
import warnings
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).parent

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

_results: List[Dict[str, Any]] = []


def _record(section: str, check: str, status: str, detail: str = "") -> None:
    _results.append({"section": section, "check": check, "status": status, "detail": detail})
    icon = {"PASS": "v", "FAIL": "x", "WARN": "!"}.get(status, "?")
    print(f"  [{icon}] {check}{(' -- ' + detail) if detail else ''}")


def _header(title: str) -> None:
    print(f"\n{'-' * 70}")
    print(f"  {title}")
    print(f"{'-' * 70}")


def validate_data_integrity() -> None:
    _header("V1 . Data Integrity")
    from forecast import load_rates
    series = load_rates(data_dir=BASE_DIR)
    n = len(series)
    _record("V1", "Row count >= 100", PASS if n >= 100 else FAIL, f"{n} observations")
    nan_count = int(series.isna().sum())
    _record("V1", "No NaN values", PASS if nan_count == 0 else FAIL, f"{nan_count} NaN(s)")
    neg_count = int((series <= 0).sum())
    _record("V1", "All index values > 0", PASS if neg_count == 0 else FAIL, f"{neg_count} non-positive")
    sorted_ok = series.index.is_monotonic_increasing
    _record("V1", "Date index monotonically increasing", PASS if sorted_ok else FAIL)
    dup_count = int(series.index.duplicated().sum())
    _record("V1", "No duplicate dates", PASS if dup_count == 0 else FAIL, f"{dup_count} duplicate(s)")
    span_days = (series.index[-1] - series.index[0]).days
    _record("V1", "Date span >= 365 days", PASS if span_days >= 365 else WARN,
            f"{span_days} days ({series.index[0].date()} to {series.index[-1].date()})")
    vmin, vmax = float(series.min()), float(series.max())
    _record("V1", "BPI range plausible (300-15000)", PASS if 300 <= vmin and vmax <= 15000 else WARN,
            f"min={vmin:.0f}, max={vmax:.0f}")


def validate_feature_engineering() -> None:
    _header("V2 . Feature Engineering (No-Lookahead)")
    from forecast import load_rates, make_features
    series = load_rates(data_dir=BASE_DIR)
    feat_df = make_features(series)
    expected_cols = {"y", "lag_1", "lag_7", "lag_30", "rolling_mean_7", "rolling_std_7", "rolling_mean_30", "rolling_std_30"}
    missing = expected_cols - set(feat_df.columns)
    _record("V2", "All 8 expected columns present", PASS if not missing else FAIL, f"missing={missing or 'none'}")
    nan_count = int(feat_df.isna().sum().sum())
    _record("V2", "No NaN in feature matrix after dropna", PASS if nan_count == 0 else FAIL, f"{nan_count} NaN(s)")
    lag1_expected = feat_df["y"].shift(1)
    mismatch = int((feat_df["lag_1"] - lag1_expected).abs().gt(1e-6).sum())
    _record("V2", "lag_1 == y.shift(1) (no lookahead)", PASS if mismatch == 0 else FAIL, f"{mismatch} mismatch(es)")
    lag7_expected = feat_df["y"].shift(7)
    mismatch7 = int((feat_df["lag_7"] - lag7_expected).abs().gt(1e-6).dropna().sum())
    _record("V2", "lag_7 == y.shift(7) (no lookahead)", PASS if mismatch7 == 0 else FAIL, f"{mismatch7} mismatch(es)")
    sample_i = 50
    idx = feat_df.index[sample_i]
    pos = series.index.get_loc(idx)
    actual_mean7 = round(float(feat_df["rolling_mean_7"].iloc[sample_i]), 4)
    expected_mean7_noleak = round(float(series.iloc[pos - 7:pos].mean()), 4)
    no_leak = abs(actual_mean7 - expected_mean7_noleak) < 0.5
    _record("V2", "rolling_mean_7 uses shift(1) (no same-day leakage)", PASS if no_leak else FAIL,
            f"actual={actual_mean7}, noleak={expected_mean7_noleak}")
    expected_rows = len(series) - 30
    actual_rows = len(feat_df)
    _record("V2", f"Feature matrix rows == len(series)-30 ({expected_rows})",
            PASS if actual_rows == expected_rows else WARN, f"actual={actual_rows}")


def validate_cost_engine() -> None:
    _header("V3 . Cost Engine (Arithmetic Invariants)")
    from rules import evaluate_candidate_vessels
    from cost import price_candidates, REFERENCE_DISTANCE_NM
    from routes import get_distance_nm
    with open(BASE_DIR / "ports.json") as f:
        ports_map = {p["id"]: p for p in json.load(f)["ports"]}
    with open(BASE_DIR / "vessels.json") as f:
        vessels_data = json.load(f)["vesselTypes"]
    test_cases = [
        ("hay-point", "paradip", 50000, "Coking Coal"),
        ("port-hedland", "paradip", 70000, "Iron Ore Fines"),
    ]
    for origin_id, dest_id, cargo_mt, cargo_type in test_cases:
        label = f"{origin_id}->{dest_id} {cargo_mt}MT"
        origin = ports_map[origin_id]
        dest = ports_map[dest_id]
        dist = get_distance_nm(origin_id, dest_id, data_dir=str(BASE_DIR))
        assumptions = {
            "usdToInr": 83.2, "demurrageUSDPerDay": 5000, "bunkerFuelPricePerMT": 620,
            "distanceNM": dist["distanceNM"],
            "originCongestionDays": origin.get("defaultCongestionDays", 1.4),
            "destCongestionDays": dest.get("defaultCongestionDays", 1.8),
            "originHandlingMTPD": origin.get("handlingCapacityMTPD", 65000),
            "destHandlingMTPD": dest.get("handlingCapacityMTPD", 35000),
            "rateScale": 1.0,
        }
        candidates = evaluate_candidate_vessels(vessels_data, origin, dest, cargo_mt, cargo_type)
        priced = price_candidates(candidates, cargo_mt, origin_id, dest_id, assumptions, data_dir=str(BASE_DIR))
        for c in priced:
            if not c.get("isFeasible"):
                continue
            v_label = f"{label}|{c['name']}"
            usd = c["costBreakdownUSD"]
            comp_sum = usd["freight"] + usd["waitingDemurrage"] + usd["bunkerFuel"] + usd["portCanalMisc"]
            delta_usd = abs(comp_sum - usd["total"])
            _record("V3", f"USD components sum to total ({v_label})", PASS if delta_usd <= 1.0 else FAIL,
                    f"sum={comp_sum:.0f} total={usd['total']:.0f} d={delta_usd:.1f}")
            cr = c["costBreakdownCr"]
            cr_sum = cr["freight"] + cr["waitingDemurrage"] + cr["bunkerFuel"] + cr["portCanalMisc"]
            delta_cr = abs(cr_sum - cr["total"])
            _record("V3", f"Cr components sum to total ({v_label})", PASS if delta_cr < 0.01 else FAIL,
                    f"sum={cr_sum:.4f} total={cr['total']:.4f} d={delta_cr:.4f}")
            expected_cr = round(usd["total"] * 83.2 / 1e7, 2)
            delta_conv = abs(expected_cr - cr["total"])
            _record("V3", f"USD->Cr conversion consistent ({v_label})",
                    PASS if delta_conv < 0.05 else FAIL,
                    f"expected={expected_cr:.2f} actual={cr['total']:.2f}")
            _record("V3", f"freightRatePerMT > 0 ({v_label})",
                    PASS if c["freightRatePerMT"] > 0 else FAIL, f"{c['freightRatePerMT']:.2f}")
    # Distance scaling test
    assumptions_2x = {"usdToInr": 83.2, "demurrageUSDPerDay": 5000, "bunkerFuelPricePerMT": 620,
                       "distanceNM": REFERENCE_DISTANCE_NM * 2, "originCongestionDays": 1.4,
                       "destCongestionDays": 1.8, "originHandlingMTPD": 65000, "destHandlingMTPD": 35000, "rateScale": 1.0}
    assumptions_1x = dict(assumptions_2x); assumptions_1x["distanceNM"] = REFERENCE_DISTANCE_NM
    c2 = evaluate_candidate_vessels(vessels_data, ports_map["hay-point"], ports_map["paradip"], 50000, "Coking Coal")
    p2 = price_candidates(c2, 50000, "hay-point", "paradip", assumptions_2x, data_dir=str(BASE_DIR))
    c1 = evaluate_candidate_vessels(vessels_data, ports_map["hay-point"], ports_map["paradip"], 50000, "Coking Coal")
    p1 = price_candidates(c1, 50000, "hay-point", "paradip", assumptions_1x, data_dir=str(BASE_DIR))
    pan2 = next((c for c in p2 if c["id"] == "panamax"), None)
    pan1 = next((c for c in p1 if c["id"] == "panamax"), None)
    if pan1 and pan2:
        ratio = pan2["freightRatePerMT"] / pan1["freightRatePerMT"]
        _record("V3", "Rate scales linearly with distance (2x dist -> ~2x rate)",
                PASS if abs(ratio - 2.0) < 0.01 else FAIL, f"ratio={ratio:.4f}")


def validate_rules_engine() -> None:
    _header("V4 . Rules Engine (Feasibility Logic)")
    from rules import evaluate_candidate_vessels, check_vessel_port_feasibility
    tight_port = {"id": "tight", "name": "Tight Port", "portEnvelope": {"maxDraftM": 10.0, "maxLoaM": 220.0, "maxBeamM": 30.0}}
    wide_port  = {"id": "wide",  "name": "Wide Port",  "portEnvelope": {"maxDraftM": 18.0, "maxLoaM": 350.0, "maxBeamM": 50.0}}
    small_v = {"id": "handysize", "name": "Handysize", "designLadenDraftM": 9.5, "loaM": 190.0, "beamM": 28.0, "referenceDwt": 35000, "cargoCapacityMT": 35000}
    big_v   = {"id": "capesize",  "name": "Capesize",  "designLadenDraftM": 18.2, "loaM": 295.0, "beamM": 48.0, "referenceDwt": 180000, "cargoCapacityMT": 180000}
    ok, reason, _ = check_vessel_port_feasibility(small_v, tight_port, 30000)
    _record("V4", "Handysize compliant at tight port (draft 9.5 <= 10.0)", PASS if ok else FAIL, reason)
    ok_big, reason_big, _ = check_vessel_port_feasibility(big_v, tight_port, 50000)
    _record("V4", "Capesize rejected at tight port (draft 18.2 > 10.0)", PASS if not ok_big else FAIL, reason_big)
    ok_wide, reason_wide, _ = check_vessel_port_feasibility(big_v, wide_port, 50000)
    _record("V4", "Capesize compliant at wide port", PASS if ok_wide else WARN, reason_wide)
    with open(BASE_DIR / "ports.json") as f:
        ports_map = {p["id"]: p for p in json.load(f)["ports"]}
    with open(BASE_DIR / "vessels.json") as f:
        vessels_data = json.load(f)["vesselTypes"]
    candidates = evaluate_candidate_vessels(vessels_data, ports_map["hay-point"], ports_map["paradip"], 50000, "Coking Coal")
    expected_order = ["handysize", "supramax", "panamax", "capesize"]
    actual_order = [c["id"] for c in candidates]
    _record("V4", "Candidate order: handysize -> supramax -> panamax -> capesize",
            PASS if actual_order == expected_order else FAIL, f"actual={actual_order}")
    feasible_ids = [c["id"] for c in candidates if c["isFeasible"]]
    _record("V4", "At least 1 feasible vessel for primary route", PASS if len(feasible_ids) >= 1 else FAIL,
            f"feasible={feasible_ids}")
    infeasible = [c for c in candidates if not c["isFeasible"]]
    reasons_ok = all(len(c.get("feasibilityReason", "")) > 0 for c in infeasible)
    _record("V4", "All infeasible candidates have non-empty feasibilityReason",
            PASS if reasons_ok else FAIL, f"{len(infeasible)} checked")


def validate_forecast_quality() -> Dict[str, Any]:
    _header("V5 . Forecast Quality")
    from forecast import load_rates, backtest, forecast_index, make_features
    from xgboost import XGBRegressor
    from sklearn.metrics import mean_absolute_percentage_error
    series = load_rates(data_dir=BASE_DIR)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        bt = backtest(series, holdout=30)
    _record("V5", "Backtest returns 3 models", PASS if len(bt) == 3 else WARN, f"{len(bt)} rows")
    xgb_row = bt[bt["model"] == "XGBoost"]
    xgb_mape = float(xgb_row["MAPE"].values[0]) if not xgb_row.empty else None
    _record("V5", "XGBoost MAPE < 30% on holdout", PASS if xgb_mape is not None and xgb_mape < 30 else FAIL,
            f"MAPE={xgb_mape}%")
    naive_row = bt[bt["model"] == "Naive"]
    naive_mape = float(naive_row["MAPE"].values[0]) if not naive_row.empty else None
    _record("V5", "XGBoost MAPE <= Naive MAPE", PASS if xgb_mape and naive_mape and xgb_mape <= naive_mape else WARN,
            f"XGBoost={xgb_mape}% Naive={naive_mape}%")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        fc = forecast_index(series, horizon=14, holdout=30)
    _record("V5", "forecast_index returns exactly 14 dates", PASS if len(fc["dates"]) == 14 else FAIL,
            f"returned {len(fc['dates'])}")
    mean_arr = np.array(fc["mean"]); lower_arr = np.array(fc["lower"]); upper_arr = np.array(fc["upper"])
    ci_ok = bool(np.all(upper_arr >= mean_arr) and np.all(mean_arr >= lower_arr))
    _record("V5", "CI invariant: lower <= mean <= upper (all 14 days)", PASS if ci_ok else FAIL,
            f"upper<mean={int(np.sum(upper_arr<mean_arr))}, mean<lower={int(np.sum(mean_arr<lower_arr))}")
    conf = fc["confidencePct"]
    _record("V5", "confidencePct in [30, 95]", PASS if 30 <= conf <= 95 else FAIL, f"{conf}%")
    _record("V5", "model_used is XGBoost or ARIMA(2,1,2)",
            PASS if fc["model_used"] in {"XGBoost", "ARIMA(2,1,2)"} else FAIL, f"'{fc['model_used']}'")
    feat_df = make_features(series)
    n = len(feat_df)
    splits = [int(n * 0.7), int(n * 0.8)]
    mapes = []
    for split in splits:
        fc_cols = [c for c in feat_df.columns if c != "y"]
        X_tr = feat_df.iloc[:split][fc_cols]; y_tr = feat_df.iloc[:split]["y"]
        X_te = feat_df.iloc[split:split+20][fc_cols]; y_te = feat_df.iloc[split:split+20]["y"]
        if len(X_te) < 5: continue
        xgb = XGBRegressor(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42, verbosity=0)
        xgb.fit(X_tr, y_tr); pred = xgb.predict(X_te)
        mapes.append(round(float(mean_absolute_percentage_error(y_te, pred) * 100), 2))
    expanding_ok = len(mapes) >= 2 and mapes[-1] <= mapes[0] * 1.5
    _record("V5", "Walk-forward expanding window: MAPE stable across splits",
            PASS if expanding_ok else WARN, f"mapes={mapes}")
    return {"bt": bt, "fc": fc, "xgb_mape": xgb_mape, "naive_mape": naive_mape}


def validate_contract_shape() -> None:
    _header("V6 . Contract Shape (API Response)")
    from recommend import recommend
    req = {"cargoType": "Coking Coal", "cargoQuantityMT": 50000,
           "originPortId": "hay-point", "destinationPortId": "paradip",
           "assumptions": {"usdToInr": 83.2, "demurrageUSDPerDay": 5000, "bunkerFuelPricePerMT": 620}}
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        response = recommend(req, data_dir=str(BASE_DIR))
    for k in ["id", "label", "cargoType", "cargoQuantityMT", "heroDecision", "kpis",
              "candidateVessels", "freightForecast", "costAnalysis", "riskAndConfidence"]:
        _record("V6", f"response['{k}'] present", PASS if k in response else FAIL)
    ts = response["freightForecast"]["timeSeries"]
    offsets = [r["dayOffset"] for r in ts]
    _record("V6", "timeSeries dayOffset monotonically increasing",
            PASS if offsets == sorted(offsets) else FAIL, f"sample={offsets[:5]}")
    current_count = sum(1 for r in ts if r.get("isCurrent"))
    _record("V6", "Exactly 1 isCurrent=True in timeSeries", PASS if current_count == 1 else FAIL, f"found {current_count}")
    trough_count = sum(1 for r in ts if r.get("isTrough") and not r.get("isHistorical") and not r.get("isCurrent"))
    _record("V6", "Exactly 1 isTrough=True in forecast rows", PASS if trough_count == 1 else FAIL, f"found {trough_count}")
    ca = response["costAnalysis"]
    total_from_items = round(sum(item["amountCr"] for item in ca["recommendedItemized"]), 2)
    total_reported = round(ca["totalCostRecommended"], 2)
    delta = abs(total_from_items - total_reported)
    _record("V6", "costAnalysis itemized sums to totalCostRecommended",
            PASS if delta < 0.05 else FAIL, f"sum={total_from_items:.2f} total={total_reported:.2f}")
    kpi_ids = {k["id"] for k in response.get("kpis", [])}
    _record("V6", "KPIs contain all 5 required panels",
            PASS if {"freight","waiting","totalCost","confidence","risk"}.issubset(kpi_ids) else FAIL, f"found={kpi_ids}")
    hd = response["heroDecision"]
    _record("V6", "heroDecision timing window populated",
            PASS if hd.get("timingWindowDates") and hd.get("charterTimingAction") else FAIL)
    _record("V6", "heroDecision.recommendedContractType in {spot, time, multi}",
            PASS if hd.get("recommendedContractType") in {"spot","time","multi"} else FAIL,
            f"value='{hd.get('recommendedContractType')}'")
    _record("V6", "candidateVessels has exactly 4 entries",
            PASS if len(response["candidateVessels"]) == 4 else FAIL, f"found {len(response['candidateVessels'])}")


def evaluate_architecture() -> Dict[str, Any]:
    _header("V7 . Architecture Evaluation (Cross-model & Multi-route)")
    from forecast import load_rates, backtest
    from recommend import recommend
    series = load_rates(data_dir=BASE_DIR)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        bt = backtest(series, holdout=30)
    print("\n  Cross-model Comparison (30-day holdout):")
    print(f"  {'Model':<20} {'MAPE %':>8}  {'RMSE':>8}")
    print(f"  {'-' * 40}")
    model_data = {}
    for _, row in bt.iterrows():
        mape_s = f"{row['MAPE']:.2f}%" if row["MAPE"] is not None else "ERROR"
        rmse_s = f"{row['RMSE']:.1f}" if row["RMSE"] is not None else "ERROR"
        print(f"  {row['model']:<20} {mape_s:>8}  {rmse_s:>8}")
        model_data[row["model"]] = {"MAPE": row["MAPE"], "RMSE": row["RMSE"]}
    print("\n  Multi-route Generalization Test:")
    test_routes = [
        ("hay-point", "paradip", 50000, "Coking Coal"),
        ("port-hedland", "paradip", 70000, "Iron Ore Fines"),
        ("santos", "alexandria", 38000, "Soybeans in Bulk"),
    ]
    route_results = []
    for origin_id, dest_id, cargo_mt, cargo_type in test_routes:
        req = {"cargoType": cargo_type, "cargoQuantityMT": cargo_mt,
               "originPortId": origin_id, "destinationPortId": dest_id,
               "assumptions": {"usdToInr": 83.2, "demurrageUSDPerDay": 5000, "bunkerFuelPricePerMT": 620}}
        route_label = f"{origin_id}->{dest_id} ({cargo_mt}MT {cargo_type})"
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                result = recommend(req, data_dir=str(BASE_DIR))
            hd = result["heroDecision"]
            route_results.append({"route": route_label, "vessel": hd["recommendedVesselId"],
                                   "cost_cr": hd["expectedTotalCostCr"], "conf_pct": hd["forecastConfidencePct"], "status": "OK"})
            print(f"  v {route_label}")
            print(f"    -> vessel={hd['recommendedVesselId']}  cost={hd['expectedTotalCostCr']:.2f}Cr  conf={hd['forecastConfidencePct']}%")
            _record("V7", f"Route completes without error: {route_label}", PASS)
        except Exception as exc:
            route_results.append({"route": route_label, "status": "ERROR", "error": str(exc)})
            print(f"  x {route_label}: {exc}")
            _record("V7", f"Route completes without error: {route_label}", FAIL, str(exc))
    return {"model_comparison": model_data, "route_results": route_results}


def generate_report(arch_data: Dict[str, Any], report_path: Path) -> None:
    results = _results
    total = len(results)
    passed = sum(1 for r in results if r["status"] == PASS)
    failed = sum(1 for r in results if r["status"] == FAIL)
    warned = sum(1 for r in results if r["status"] == WARN)
    score = round(passed / total * 100, 1) if total else 0
    sections = {}
    for r in results:
        sections.setdefault(r["section"], []).append(r)
    section_labels = {
        "V1": "Data Integrity",
        "V2": "Feature Engineering (No-Lookahead)",
        "V3": "Cost Engine (Arithmetic Invariants)",
        "V4": "Rules Engine (Feasibility Logic)",
        "V5": "Forecast Quality",
        "V6": "Contract Shape (API Response)",
        "V7": "Architecture Evaluation (Cross-model & Multi-route)",
    }
    md = []
    md.append("# Charter AI � Validation & Model Evaluation Report\n")
    md.append(f"**Total Checks**: {total}  |  **Passed**: {passed}  |  **Failed**: {failed}  |  **Warnings**: {warned}  |  **Score**: {score}%\n")
    md.append("---\n")
    md.append("## Summary Table\n")
    md.append("| Section | Checks | Passed | Failed | Warnings |")
    md.append("| :--- | :---: | :---: | :---: | :---: |")
    for sec_id, sec_label in section_labels.items():
        sec_rows = sections.get(sec_id, [])
        s_pass = sum(1 for r in sec_rows if r["status"] == PASS)
        s_fail = sum(1 for r in sec_rows if r["status"] == FAIL)
        s_warn = sum(1 for r in sec_rows if r["status"] == WARN)
        icon = "OK" if s_fail == 0 else "FAIL"
        md.append(f"| [{icon}] **{sec_id}** {sec_label} | {len(sec_rows)} | {s_pass} | {s_fail} | {s_warn} |")
    md.append("\n---\n")
    for sec_id, sec_label in section_labels.items():
        sec_rows = sections.get(sec_id, [])
        if not sec_rows: continue
        md.append(f"## {sec_id} - {sec_label}\n")
        md.append("| Status | Check | Detail |")
        md.append("| :---: | :--- | :--- |")
        for r in sec_rows:
            icon = {"PASS": "PASS", "FAIL": "FAIL", "WARN": "WARN"}.get(r["status"], "?")
            detail = r["detail"].replace("|", "\\|")
            md.append(f"| {icon} | {r['check']} | {detail} |")
        md.append("")
    md.append("---\n")
    md.append("## V7 - Cross-model Performance Comparison (30-day holdout)\n")
    md.append("| Model | MAPE (%) | RMSE | Notes |")
    md.append("| :--- | :---: | :---: | :--- |")
    for model_name, metrics in arch_data.get("model_comparison", {}).items():
        mape_s = f"{metrics['MAPE']:.2f}" if metrics["MAPE"] else "ERROR"
        rmse_s = f"{metrics['RMSE']:.1f}" if metrics["RMSE"] else "ERROR"
        note = {"Naive": "Carry-forward baseline -- no parameters",
                "ARIMA(2,1,2)": "ARIMA(2,1,2) -- order is ASSUMPTION (untuned)",
                "XGBoost": "XGBoost 7 lag/rolling features -- deployed model"}.get(model_name, "")
        md.append(f"| **{model_name}** | {mape_s} | {rmse_s} | {note} |")
    md.append("\n## V7 - Multi-route Generalization Results\n")
    md.append("| Route | Recommended Vessel | Cost (Cr) | Confidence | Status |")
    md.append("| :--- | :---: | :---: | :---: | :---: |")
    for rr in arch_data.get("route_results", []):
        if rr["status"] == "OK":
            md.append(f"| {rr['route']} | `{rr['vessel']}` | {rr['cost_cr']:.2f} | {rr['conf_pct']}% | OK |")
        else:
            md.append(f"| {rr['route']} | -- | -- | -- | FAIL: {str(rr.get('error',''))[:60]} |")
    md.append("\n---\n")
    md.append("## Architecture Notes & Known Assumptions\n")
    md.append("1. **Freight rate scaling** (BPI_TO_USD_PER_MT = 28.50/3178.0) calibrated to a single reference point -- indicative only.")
    md.append("2. **ARIMA order (2,1,2)** is a prototype assumption; AIC/BIC selection was not performed.")
    md.append("3. **XGBoost hyperparameters** (n_estimators=200, lr=0.05, max_depth=4) are prototype defaults -- not tuned.")
    md.append("4. **Uncertainty bands** use sqrt(t) widening heuristic (1.5x MAPE scale) -- a common approximation.")
    md.append("5. **TC_PREMIUM (8%) and COA_DISCOUNT (5%)** are industry heuristics without historical calibration.")
    md.append("6. **Vessel availability (7 prompt ships)** is labelled SIMULATED -- no live AIS data.")
    report_text = "\n".join(md)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_text)


if __name__ == "__main__":
    print("=" * 70)
    print("  Charter AI -- Validation & Model Evaluation Suite")
    print("=" * 70)
    validate_data_integrity()
    validate_feature_engineering()
    validate_cost_engine()
    validate_rules_engine()
    validate_forecast_quality()
    validate_contract_shape()
    arch_data = evaluate_architecture()
    total = len(_results)
    passed = sum(1 for r in _results if r["status"] == PASS)
    failed = sum(1 for r in _results if r["status"] == FAIL)
    warned = sum(1 for r in _results if r["status"] == WARN)
    report_path = BASE_DIR / "validation_report.md"
    generate_report(arch_data, report_path)
    print("\n" + "=" * 70)
    print(f"  FINAL SCORE: {passed}/{total} passed  |  {failed} failed  |  {warned} warnings")
    print(f"  Report written -> {report_path.resolve()}")
    print("=" * 70)
    if failed > 0:
        print("\n  FAILED CHECKS:")
        for r in _results:
            if r["status"] == FAIL:
                print(f"    [{r['section']}] {r['check']} -- {r['detail']}")
