# Charter AI � Validation & Model Evaluation Report

**Total Checks**: 73  |  **Passed**: 71  |  **Failed**: 0  |  **Warnings**: 2  |  **Score**: 97.3%

---

## Summary Table

| Section | Checks | Passed | Failed | Warnings |
| :--- | :---: | :---: | :---: | :---: |
| [OK] **V1** Data Integrity | 7 | 7 | 0 | 0 |
| [OK] **V2** Feature Engineering (No-Lookahead) | 6 | 6 | 0 | 0 |
| [OK] **V3** Cost Engine (Arithmetic Invariants) | 25 | 25 | 0 | 0 |
| [OK] **V4** Rules Engine (Feasibility Logic) | 6 | 5 | 0 | 1 |
| [OK] **V5** Forecast Quality | 8 | 7 | 0 | 1 |
| [OK] **V6** Contract Shape (API Response) | 18 | 18 | 0 | 0 |
| [OK] **V7** Architecture Evaluation (Cross-model & Multi-route) | 3 | 3 | 0 | 0 |

---

## V1 - Data Integrity

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | Row count >= 100 | 495 observations |
| PASS | No NaN values | 0 NaN(s) |
| PASS | All index values > 0 | 0 non-positive |
| PASS | Date index monotonically increasing |  |
| PASS | No duplicate dates | 0 duplicate(s) |
| PASS | Date span >= 365 days | 729 days (2024-09-30 to 2026-09-29) |
| PASS | BPI range plausible (300-15000) | min=715, max=3628 |

## V2 - Feature Engineering (No-Lookahead)

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | All 8 expected columns present | missing=none |
| PASS | No NaN in feature matrix after dropna | 0 NaN(s) |
| PASS | lag_1 == y.shift(1) (no lookahead) | 0 mismatch(es) |
| PASS | lag_7 == y.shift(7) (no lookahead) | 0 mismatch(es) |
| PASS | rolling_mean_7 uses shift(1) (no same-day leakage) | actual=875.4286, noleak=875.4286 |
| PASS | Feature matrix rows == len(series)-30 (465) | actual=465 |

## V3 - Cost Engine (Arithmetic Invariants)

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | USD components sum to total (hay-point->paradip 50000MT|Handysize) | sum=2426289 total=2426289 d=0.0 |
| PASS | Cr components sum to total (hay-point->paradip 50000MT|Handysize) | sum=20.1900 total=20.1900 d=0.0000 |
| PASS | USD->Cr conversion consistent (hay-point->paradip 50000MT|Handysize) | expected=20.19 actual=20.19 |
| PASS | freightRatePerMT > 0 (hay-point->paradip 50000MT|Handysize) | 37.80 |
| PASS | USD components sum to total (hay-point->paradip 50000MT|Supramax / Ultramax) | sum=1909214 total=1909214 d=0.0 |
| PASS | Cr components sum to total (hay-point->paradip 50000MT|Supramax / Ultramax) | sum=15.8800 total=15.8800 d=0.0000 |
| PASS | USD->Cr conversion consistent (hay-point->paradip 50000MT|Supramax / Ultramax) | expected=15.88 actual=15.88 |
| PASS | freightRatePerMT > 0 (hay-point->paradip 50000MT|Supramax / Ultramax) | 32.10 |
| PASS | USD components sum to total (hay-point->paradip 50000MT|Panamax / Kamsarmax) | sum=1778733 total=1778733 d=0.0 |
| PASS | Cr components sum to total (hay-point->paradip 50000MT|Panamax / Kamsarmax) | sum=14.8000 total=14.8000 d=0.0000 |
| PASS | USD->Cr conversion consistent (hay-point->paradip 50000MT|Panamax / Kamsarmax) | expected=14.80 actual=14.80 |
| PASS | freightRatePerMT > 0 (hay-point->paradip 50000MT|Panamax / Kamsarmax) | 28.50 |
| PASS | USD components sum to total (port-hedland->paradip 70000MT|Handysize) | sum=2556409 total=2556408 d=1.0 |
| PASS | Cr components sum to total (port-hedland->paradip 70000MT|Handysize) | sum=21.2700 total=21.2700 d=0.0000 |
| PASS | USD->Cr conversion consistent (port-hedland->paradip 70000MT|Handysize) | expected=21.27 actual=21.27 |
| PASS | freightRatePerMT > 0 (port-hedland->paradip 70000MT|Handysize) | 30.18 |
| PASS | USD components sum to total (port-hedland->paradip 70000MT|Supramax / Ultramax) | sum=2288686 total=2288686 d=0.0 |
| PASS | Cr components sum to total (port-hedland->paradip 70000MT|Supramax / Ultramax) | sum=19.0400 total=19.0400 d=0.0000 |
| PASS | USD->Cr conversion consistent (port-hedland->paradip 70000MT|Supramax / Ultramax) | expected=19.04 actual=19.04 |
| PASS | freightRatePerMT > 0 (port-hedland->paradip 70000MT|Supramax / Ultramax) | 25.63 |
| PASS | USD components sum to total (port-hedland->paradip 70000MT|Panamax / Kamsarmax) | sum=1887150 total=1887149 d=1.0 |
| PASS | Cr components sum to total (port-hedland->paradip 70000MT|Panamax / Kamsarmax) | sum=15.7000 total=15.7000 d=0.0000 |
| PASS | USD->Cr conversion consistent (port-hedland->paradip 70000MT|Panamax / Kamsarmax) | expected=15.70 actual=15.70 |
| PASS | freightRatePerMT > 0 (port-hedland->paradip 70000MT|Panamax / Kamsarmax) | 22.75 |
| PASS | Rate scales linearly with distance (2x dist -> ~2x rate) | ratio=2.0000 |

## V4 - Rules Engine (Feasibility Logic)

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | Handysize compliant at tight port (draft 9.5 <= 10.0) | Compliant with Tight Port envelope (draft 9.5m <= 10.0m). |
| PASS | Capesize rejected at tight port (draft 18.2 > 10.0) | Draft exceeds Tight Port limit: 18.2m > 10.0m (clearance: -8.2m). |
| WARN | Capesize compliant at wide port | Draft exceeds Wide Port limit: 18.2m > 18.0m (clearance: -0.2m). |
| PASS | Candidate order: handysize -> supramax -> panamax -> capesize | actual=['handysize', 'supramax', 'panamax', 'capesize'] |
| PASS | At least 1 feasible vessel for primary route | feasible=['handysize', 'supramax', 'panamax'] |
| PASS | All infeasible candidates have non-empty feasibilityReason | 1 checked |

## V5 - Forecast Quality

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | Backtest returns 3 models | 3 rows |
| PASS | XGBoost MAPE < 30% on holdout | MAPE=8.06% |
| PASS | XGBoost MAPE <= Naive MAPE | XGBoost=8.06% Naive=12.21% |
| PASS | forecast_index returns exactly 14 dates | returned 14 |
| PASS | CI invariant: lower <= mean <= upper (all 14 days) | upper<mean=0, mean<lower=0 |
| PASS | confidencePct in [30, 95] | 75% |
| PASS | model_used is XGBoost or ARIMA(2,1,2) | 'XGBoost' |
| WARN | Walk-forward expanding window: MAPE stable across splits | mapes=[1.65, 4.33] |

## V6 - Contract Shape (API Response)

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | response['id'] present |  |
| PASS | response['label'] present |  |
| PASS | response['cargoType'] present |  |
| PASS | response['cargoQuantityMT'] present |  |
| PASS | response['heroDecision'] present |  |
| PASS | response['kpis'] present |  |
| PASS | response['candidateVessels'] present |  |
| PASS | response['freightForecast'] present |  |
| PASS | response['costAnalysis'] present |  |
| PASS | response['riskAndConfidence'] present |  |
| PASS | timeSeries dayOffset monotonically increasing | sample=[-14, -13, -12, -11, -10] |
| PASS | Exactly 1 isCurrent=True in timeSeries | found 1 |
| PASS | Exactly 1 isTrough=True in forecast rows | found 1 |
| PASS | costAnalysis itemized sums to totalCostRecommended | sum=12.16 total=12.16 |
| PASS | KPIs contain all 5 required panels | found={'waiting', 'confidence', 'risk', 'freight', 'totalCost'} |
| PASS | heroDecision timing window populated |  |
| PASS | heroDecision.recommendedContractType in {spot, time, multi} | value='time' |
| PASS | candidateVessels has exactly 4 entries | found 4 |

## V7 - Architecture Evaluation (Cross-model & Multi-route)

| Status | Check | Detail |
| :---: | :--- | :--- |
| PASS | Route completes without error: hay-point->paradip (50000MT Coking Coal) |  |
| PASS | Route completes without error: port-hedland->paradip (70000MT Iron Ore Fines) |  |
| PASS | Route completes without error: santos->alexandria (38000MT Soybeans in Bulk) |  |

---

## V7 - Cross-model Performance Comparison (30-day holdout)

| Model | MAPE (%) | RMSE | Notes |
| :--- | :---: | :---: | :--- |
| **Naive** | 12.21 | 474.4 | Carry-forward baseline -- no parameters |
| **ARIMA(2,1,2)** | 12.19 | 473.8 | ARIMA(2,1,2) -- order is ASSUMPTION (untuned) |
| **XGBoost** | 8.06 | 318.0 | XGBoost 7 lag/rolling features -- deployed model |

## V7 - Multi-route Generalization Results

| Route | Recommended Vessel | Cost (Cr) | Confidence | Status |
| :--- | :---: | :---: | :---: | :---: |
| hay-point->paradip (50000MT Coking Coal) | `panamax` | 12.16 | 76% | OK |
| port-hedland->paradip (70000MT Iron Ore Fines) | `panamax` | 12.75 | 76% | OK |
| santos->alexandria (38000MT Soybeans in Bulk) | `supramax` | 14.69 | 76% | OK |

---

## Architecture Notes & Known Assumptions

1. **Freight rate scaling** (BPI_TO_USD_PER_MT = 28.50/3178.0) calibrated to a single reference point -- indicative only.
2. **ARIMA order (2,1,2)** is a prototype assumption; AIC/BIC selection was not performed.
3. **XGBoost hyperparameters** (n_estimators=200, lr=0.05, max_depth=4) are prototype defaults -- not tuned.
4. **Uncertainty bands** use sqrt(t) widening heuristic (1.5x MAPE scale) -- a common approximation.
5. **TC_PREMIUM (8%) and COA_DISCOUNT (5%)** are industry heuristics without historical calibration.
6. **Vessel availability (7 prompt ships)** is labelled SIMULATED -- no live AIS data.