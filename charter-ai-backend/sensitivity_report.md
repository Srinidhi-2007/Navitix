# Charter AI -- Parameter Sensitivity Analysis Report

**Baseline Route**: Hay Point to Paradip  |  50,000 MT Coking Coal
**Baseline Vessel**: `panamax` | **Cost**: 12.16 Cr | **Confidence**: 76% | **MAPE**: 8.06%

---

## Summary Table

Elasticity = (pct change in Cost Cr) / (pct change in parameter). |E| > 1.0 = elastic (highly sensitive).

| Parameter | Group | Cost Range (Cr) | Max Swing | Vessel Stable? | Max Elasticity |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **USD/INR Exchange Rate** | Cost Engine | 10.96 to 13.44 | 10.5% | YES | 1.002 |
| **Demurrage Rate (USD/day)** | Cost Engine | 12.02 to 12.47 | 2.5% | YES | 0.031 |
| **Bunker Fuel Price (USD/MT)** | Cost Engine | 11.49 to 13.06 | 7.4% | YES | 0.228 |
| **Cargo Quantity (MT)** | Cargo | 7.36 to 21.63 | 77.9% | NO (switches) | 1.214 |

---

## Cost Engine: USD/INR Exchange Rate

| Value | Vessel | Cost (Cr) | Change vs Baseline | Elasticity | Confidence |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 75.0 | panamax | 10.96 | -9.9% | 1.001 | 76% |
| 78.0 | panamax | 11.40 | -6.2% | 1.000 | 76% |
| 80.6 | panamax | 11.78 | -3.1% | 1.000 | 76% |
| 83.2 | panamax | 12.16 | +0.0% | 0.000 | 76% |
| 86.0 | panamax | 12.57 | +3.4% | 1.002 | 76% |
| 88.0 | panamax | 12.86 | +5.8% | 0.998 | 76% |
| 92.0 | panamax | 13.44 | +10.5% | 0.995 | 76% |

## Cost Engine: Demurrage Rate (USD/day)

| Value | Vessel | Cost (Cr) | Change vs Baseline | Elasticity | Confidence |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 2000 | panamax | 12.02 | -1.1% | 0.014 | 76% |
| 3500 | panamax | 12.09 | -0.6% | 0.016 | 76% |
| 5000 | panamax | 12.16 | +0.0% | 0.000 | 76% |
| 7000 | panamax | 12.25 | +0.7% | 0.022 | 76% |
| 9000 | panamax | 12.34 | +1.5% | 0.026 | 76% |
| 12000 | panamax | 12.47 | +2.5% | 0.031 | 76% |

## Cost Engine: Bunker Fuel Price (USD/MT)

| Value | Vessel | Cost (Cr) | Change vs Baseline | Elasticity | Confidence |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 450 | panamax | 11.49 | -5.5% | 0.178 | 76% |
| 520 | panamax | 11.77 | -3.2% | 0.186 | 76% |
| 580 | panamax | 12.00 | -1.3% | 0.199 | 76% |
| 620 | panamax | 12.16 | +0.0% | 0.000 | 76% |
| 680 | panamax | 12.39 | +1.9% | 0.203 | 76% |
| 750 | panamax | 12.67 | +4.2% | 0.216 | 76% |
| 850 | panamax | 13.06 | +7.4% | 0.228 | 76% |

## Cargo: Cargo Quantity (MT)

| Value | Vessel | Cost (Cr) | Change vs Baseline | Elasticity | Confidence |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 20000 | **handysize** | 7.36 | -39.5% | 0.574 | 76% |
| 30000 | **handysize** | 9.57 | -21.3% | 0.477 | 76% |
| 40000 | **supramax** | 10.82 | -11.0% | 0.525 | 76% |
| 50000 | panamax | 12.16 | +0.0% | 0.000 | 76% |
| 60000 | panamax | 14.02 | +15.3% | 0.782 | 76% |
| 70000 | panamax | 15.88 | +30.6% | 0.796 | 76% |
| 80000 | **supramax** | 21.63 | +77.9% | 1.214 | 76% |

---

## Key Findings

1. **USD/INR Exchange Rate**: Cr cost scales ~linearly (E ~1.0). Does not affect vessel selection across the entire range tested.
2. **Demurrage Rate**: Moderate sensitivity. Higher demurrage raises costs roughly in proportion to waiting days per voyage; no vessel switch observed.
3. **Bunker Fuel Price**: Scales only with sea days and fuel consumption; long-haul vessels with high consumption are most exposed.
4. **Cargo Quantity**: Critical threshold parameter -- vessel recommendation switches when cargo exceeds a vessel class capacity. This is the only parameter that can change the recommended vessel.
5. **Conclusion**: Cost-magnitude parameters (FX, demurrage, bunker) are predictably elastic and do not threaten decision quality. Cargo quantity is the primary decision-stability risk factor.