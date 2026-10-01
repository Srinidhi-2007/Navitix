"""
Charter AI - Freight Rate Forecasting Engine
File: forecast.py

Provides:
  load_rates()          -> pd.Series of freight index values (date index)
  make_features()       -> lagged features with no lookahead leakage
  backtest()            -> MAPE/RMSE table for naive, ARIMA, XGBoost
  forecast_index()      -> 14-day forecast with confidence bands + model metadata
  to_rate_series()      -> contract.json timeSeries shape
  summarize_forecast()  -> contract.json freightForecast object

All model hyperparameters are ASSUMPTIONS suitable for a prototype.
ARIMA order (2,1,2) and XGBoost defaults are NOT tuned.
"""

import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_percentage_error

BASE_DIR = Path(__file__).parent

# ── BPI scaling factor (maps Baltic Panamax Index points to $/MT freight rate) ──
# Calibrated to real Baltic Panamax Index level: 3,178 BPI ≈ $28.50/MT on reference route
BPI_TO_USD_PER_MT = 28.50 / 3178.0  # ≈ 0.0089679


# ── Data loading ─────────────────────────────────────────────────────────────

def load_rates(data_dir: Path = BASE_DIR) -> pd.Series:
    """
    Loads the freight rate index from rates.csv (creating it if absent).
    Returns a pd.Series with DatetimeIndex, values = index_value.
    """
    from rates_loader import ensure_rates_csv
    df = ensure_rates_csv(data_dir)
    df["date"] = pd.to_datetime(df["date"])
    s = df.set_index("date")["index_value"].sort_index().astype(float)
    return s


# ── Feature engineering (no leakage) ─────────────────────────────────────────

def make_features(series: pd.Series) -> pd.DataFrame:
    """
    Builds lag and rolling features for the series.
    All features shift forward (no lookahead leakage).
    """
    df = pd.DataFrame({"y": series})
    for lag in [1, 7, 30]:
        df[f"lag_{lag}"] = df["y"].shift(lag)
    df["rolling_mean_7"]  = df["y"].shift(1).rolling(7).mean()
    df["rolling_std_7"]   = df["y"].shift(1).rolling(7).std()
    df["rolling_mean_30"] = df["y"].shift(1).rolling(30).mean()
    df["rolling_std_30"]  = df["y"].shift(1).rolling(30).std()
    return df.dropna()


# ── Metrics helpers ───────────────────────────────────────────────────────────

def _rmse(actual: np.ndarray, pred: np.ndarray) -> float:
    return float(np.sqrt(np.mean((actual - pred) ** 2)))


def _mape(actual: np.ndarray, pred: np.ndarray) -> float:
    return float(mean_absolute_percentage_error(actual, pred))


# ── Backtest ──────────────────────────────────────────────────────────────────

def backtest(series: pd.Series, holdout: int = 30) -> pd.DataFrame:
    """
    Runs naive, ARIMA(2,1,2), and XGBoost models over the last `holdout` days.
    Returns DataFrame with columns: model, MAPE, RMSE.
    ARIMA order (2,1,2) — ASSUMPTION: not tuned.
    """
    train = series.iloc[:-holdout]
    test  = series.iloc[-holdout:]
    actual = test.values
    results = []

    # 1. Naive (last value carry-forward)
    naive_pred = np.full(holdout, train.iloc[-1])
    results.append({
        "model": "Naive",
        "MAPE":  round(_mape(actual, naive_pred) * 100, 2),
        "RMSE":  round(_rmse(actual, naive_pred), 1),
    })

    # 2. ARIMA(2,1,2) — ASSUMPTION on order
    try:
        from statsmodels.tsa.arima.model import ARIMA
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            fit = ARIMA(train.values, order=(2, 1, 2)).fit()
            arima_pred = fit.forecast(holdout)
        results.append({
            "model": "ARIMA(2,1,2)",
            "MAPE":  round(_mape(actual, arima_pred) * 100, 2),
            "RMSE":  round(_rmse(actual, arima_pred), 1),
        })
    except Exception as exc:
        results.append({"model": "ARIMA(2,1,2)", "MAPE": None, "RMSE": None, "_error": str(exc)})

    # 3. XGBoost on lagged features — ASSUMPTION: defaults, no hyperparameter search
    try:
        from xgboost import XGBRegressor
        feat_df   = make_features(series)
        feat_train = feat_df.iloc[:-holdout]
        feat_test  = feat_df.iloc[-holdout:]
        feature_cols = [c for c in feat_df.columns if c != "y"]
        xgb = XGBRegressor(n_estimators=200, learning_rate=0.05, random_state=42, verbosity=0)
        xgb.fit(feat_train[feature_cols], feat_train["y"])
        xgb_pred = xgb.predict(feat_test[feature_cols])
        results.append({
            "model": "XGBoost",
            "MAPE":  round(_mape(actual, xgb_pred) * 100, 2),
            "RMSE":  round(_rmse(actual, xgb_pred), 1),
        })
    except Exception as exc:
        results.append({"model": "XGBoost", "MAPE": None, "RMSE": None, "_error": str(exc)})

    return pd.DataFrame(results)[["model", "MAPE", "RMSE"]]


# ── Main forecast ─────────────────────────────────────────────────────────────

def forecast_index(
    series: pd.Series,
    horizon: int = 14,
    holdout: int = 30,
) -> Dict[str, Any]:
    """
    Picks best model (ARIMA vs XGBoost) by MAPE from backtest.
    Returns dict with keys:
      dates, mean, lower, upper, model_used,
      feature_importances, mape, confidencePct
    """
    bt = backtest(series, holdout)
    # Drop naive; pick ARIMA or XGBoost with lowest MAPE
    candidates = bt[bt["model"] != "Naive"].dropna(subset=["MAPE"])
    if candidates.empty:
        raise RuntimeError("Both ARIMA and XGBoost failed backtest")

    best_row   = candidates.loc[candidates["MAPE"].idxmin()]
    model_used = best_row["model"]
    best_mape  = float(best_row["MAPE"]) / 100.0

    # Generate future dates (business days)
    last_date  = series.index[-1]
    future_dates = pd.bdate_range(last_date + pd.Timedelta("1D"), periods=horizon)

    feat_importances: Optional[Dict[str, float]] = None

    if "ARIMA" in model_used:
        from statsmodels.tsa.arima.model import ARIMA
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            fit = ARIMA(series.values, order=(2, 1, 2)).fit()
        res = fit.get_forecast(horizon)
        mean_vals  = res.predicted_mean
        conf       = res.conf_int(alpha=0.05)
        lower_vals = conf[:, 0]
        upper_vals = conf[:, 1]

    else:  # XGBoost — iterative one-step-ahead
        from xgboost import XGBRegressor
        feat_df  = make_features(series)
        feature_cols = [c for c in feat_df.columns if c != "y"]
        xgb = XGBRegressor(n_estimators=200, learning_rate=0.05, random_state=42, verbosity=0)
        xgb.fit(feat_df[feature_cols], feat_df["y"])

        # Extend series iteratively
        extended = series.copy()
        mean_vals  = []
        for _ in range(horizon):
            feat_row = make_features(extended).iloc[[-1]]
            pred_val = float(xgb.predict(feat_row[feature_cols])[0])
            mean_vals.append(pred_val)
            new_idx = extended.index[-1] + pd.tseries.offsets.BDay(1)
            extended = pd.concat([extended, pd.Series([pred_val], index=[new_idx])])

        mean_vals  = np.array(mean_vals)
        # ASSUMPTION: uncertainty band widens with sqrt(t), scaled to 1.5x MAPE at horizon
        band_scale = best_mape * mean_vals * np.sqrt(np.arange(1, horizon + 1) / horizon) * 1.5
        lower_vals = mean_vals - 1.96 * band_scale
        upper_vals = mean_vals + 1.96 * band_scale

        # Feature importances (normalised)
        imp = xgb.feature_importances_
        feat_importances = {
            k: round(float(v * 100), 1)
            for k, v in sorted(zip(feature_cols, imp), key=lambda x: -x[1])
        }

    # Relative band width metric for confidence formula
    mean_band = np.mean((upper_vals - lower_vals) / (np.abs(mean_vals) + 1e-9))

    # confidencePct formula from spec (never hard-coded)
    confidence_pct = int(np.clip(
        round(100 * (1 - best_mape) - 50 * mean_band),
        30, 95,
    ))

    return {
        "dates":               list(future_dates.strftime("%Y-%m-%d")),
        "mean":                list(np.round(mean_vals, 1)),
        "lower":               list(np.round(lower_vals, 1)),
        "upper":               list(np.round(upper_vals, 1)),
        "model_used":          model_used,
        "feature_importances": feat_importances,
        "mape":                round(best_mape * 100, 2),
        "confidencePct":       confidence_pct,
    }


# ── Contract-shape helpers ─────────────────────────────────────────────────────

def to_rate_series(
    series: pd.Series,
    forecast: Dict[str, Any],
    lookback: int = 14,
    optimal_window: Tuple[int, int] = (3, 5),
) -> List[Dict[str, Any]]:
    """
    Builds the timeSeries list matching contract.json shape.
    Historical: dayOffset -lookback..-1, actualRate filled, isHistorical=True.
    Forecast:   dayOffset 1..horizon, forecastRate/lowerBand/upperBand, isHistorical=False.
    dayOffset=0 = today (current market rate).
    """
    # Convert index to $/MT using scaling factor
    def to_usd(idx_val: float) -> float:
        return round(idx_val * BPI_TO_USD_PER_MT, 2)

    hist = series.iloc[-lookback:]
    today_val = float(series.iloc[-1])
    today_date = series.index[-1]

    rows: List[Dict[str, Any]] = []

    # Historical points (dayOffset negative)
    for i, (dt, val) in enumerate(hist.items()):
        offset = i - lookback  # -14 to -1
        rows.append({
            "dayOffset":   offset,
            "date":        dt.strftime("%b %d"),
            "actualRate":  to_usd(float(val)),
            "forecastRate": None,
            "lowerBand":   None,
            "upperBand":   None,
            "benchmarkBPI": round(float(val), 1),
            "isHistorical": True,
            "isCurrent":   False,
            "isTrough":    False,
            "inOptimalWindow": False,
        })

    # Current day (offset=0)
    rows.append({
        "dayOffset":   0,
        "date":        today_date.strftime("%b %d"),
        "actualRate":  to_usd(today_val),
        "forecastRate": to_usd(today_val),
        "lowerBand":   None,
        "upperBand":   None,
        "benchmarkBPI": round(today_val, 1),
        "isHistorical": False,
        "isCurrent":   True,
        "isTrough":    False,
        "inOptimalWindow": False,
    })

    # Forecast points (offset 1..horizon)
    mean_vals  = forecast["mean"]
    lower_vals = forecast["lower"]
    upper_vals = forecast["upper"]
    dates_str  = forecast["dates"]

    trough_idx = int(np.argmin(mean_vals))

    for i, (d, m, lo, hi) in enumerate(zip(dates_str, mean_vals, lower_vals, upper_vals)):
        offset = i + 1
        dt_obj = pd.Timestamp(d)
        rows.append({
            "dayOffset":    offset,
            "date":         dt_obj.strftime("%b %d"),
            "actualRate":   None,
            "forecastRate": to_usd(float(m)),
            "lowerBand":    to_usd(float(lo)),
            "upperBand":    to_usd(float(hi)),
            "benchmarkBPI": round(float(m), 1),
            "isHistorical": False,
            "isCurrent":    False,
            "isTrough":     (i == trough_idx),
            "inOptimalWindow": optimal_window[0] <= offset <= optimal_window[1],
        })

    return sorted(rows, key=lambda r: r["dayOffset"])


def summarize_forecast(
    series: pd.Series,
    forecast: Dict[str, Any],
    optimal_window: Tuple[int, int] = (3, 5),
) -> Dict[str, Any]:
    """Returns the freightForecast object matching contract.json shape."""
    mean_vals = np.array(forecast["mean"])
    today_rate = float(series.iloc[-1]) * BPI_TO_USD_PER_MT
    trough_idx = int(np.argmin(mean_vals))
    trough_rate = round(float(mean_vals[trough_idx]) * BPI_TO_USD_PER_MT, 2)
    expected_change_pct = round((trough_rate - today_rate) / today_rate * 100, 1)
    trough_date = forecast["dates"][trough_idx]
    trough_dt   = pd.Timestamp(trough_date)

    time_series = to_rate_series(series, forecast, optimal_window=optimal_window)

    return {
        "currency":               "$/MT",
        "currentMarketRate":      round(today_rate, 2),
        "forecastRateIn7Days":    round(float(mean_vals[6]) * BPI_TO_USD_PER_MT, 2) if len(mean_vals) > 6 else None,
        "forecastHorizonDays":    len(mean_vals),
        "expectedChangePct":      expected_change_pct,
        "expectedChangeDirection": "favorable" if expected_change_pct < 0 else "unfavorable",
        "optimalWindowStartDay":  optimal_window[0],
        "optimalWindowEndDay":    optimal_window[1],
        "optimalWindowDateRange": f"Day {optimal_window[0]}-{optimal_window[1]}",
        "troughDayOffset":        trough_idx + 1,
        "troughDate":             trough_dt.strftime("%b %d, %Y"),
        "troughRate":             trough_rate,
        "benchmarkName":          "Baltic Panamax Index (BPI, synthetic)" if "synthetic" in str(series.name or "") else "Baltic Panamax Index (BPI)",
        "modelUsed":              forecast["model_used"],
        "confidencePct":          forecast["confidencePct"],
        "mape":                   forecast["mape"],
        "timeSeries":             time_series,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    print("Loading rates...", flush=True)
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        series = load_rates()
        for w in caught:
            print(f"\n{'!'*60}", file=sys.stderr)
            print(str(w.message), file=sys.stderr)
            print(f"{'!'*60}\n", file=sys.stderr)

    print(f"Loaded {len(series)} observations, last date: {series.index[-1].date()}")
    print(f"Rate range: {series.min():.1f} - {series.max():.1f}  (mean {series.mean():.1f})\n")

    print("Running backtest (holdout=30 days)...")
    bt = backtest(series, holdout=30)
    print("\nBacktest Results:")
    print(bt.to_string(index=False))

    print("\nRunning 14-day forecast...")
    fc = forecast_index(series, horizon=14, holdout=30)

    print(f"\nModel chosen    : {fc['model_used']}")
    print(f"Backtest MAPE   : {fc['mape']}%")
    print(f"Confidence Score: {fc['confidencePct']}%")

    mean_arr = np.array(fc["mean"])
    trough_i = int(np.argmin(mean_arr))
    print(f"Trough day      : +{trough_i+1} ({fc['dates'][trough_i]})  index={mean_arr[trough_i]:.1f}")
    print(f"Optimal window  : day +3 to +5")

    if fc.get("feature_importances"):
        print("\nTop feature importances (XGBoost):")
        for feat, imp in list(fc["feature_importances"].items())[:5]:
            print(f"  {feat:<22} {imp:.1f}%")

    summary = summarize_forecast(series, fc)
    print(f"\nFreight forecast summary:")
    print(f"  Current rate   : ${summary['currentMarketRate']:.2f}/MT")
    print(f"  Trough rate    : ${summary['troughRate']:.2f}/MT  (day +{summary['troughDayOffset']}, {summary['troughDate']})")
    print(f"  Expected change: {summary['expectedChangePct']:+.1f}%  ({summary['expectedChangeDirection']})")
    print(f"  Rate @day+7    : ${summary['forecastRateIn7Days']:.2f}/MT")
    print(f"  timeSeries pts : {len(summary['timeSeries'])} (lookback-14 + today + horizon-14)")
