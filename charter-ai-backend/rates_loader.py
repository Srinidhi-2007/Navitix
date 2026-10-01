"""
Charter AI — Freight Rate Data Loader
File: rates.csv generator (called from forecast.py on first run)

If rates_raw.csv exists: clean it to standard format (date, index_value, source=real).
Otherwise: generate a synthetic mean-reverting Baltic Panamax Index-like series
           seeded at 42, 3 years of business days, source=synthetic.
WARNING printed to stderr when synthetic data is used.
"""

import sys
import warnings
import numpy as np
import pandas as pd
from pathlib import Path


SYNTH_MEAN  = 1500.0   # ASSUMPTION: indicative BPI-like centre for synthetic series
SYNTH_SEED  = 42
SYNTH_VOL   = 0.012    # ASSUMPTION: daily log-return volatility (indicative)
SYNTH_THETA = 0.05     # ASSUMPTION: mean-reversion speed (Ornstein-Uhlenbeck, indicative)


def _build_synthetic(out_path: Path) -> pd.DataFrame:
    """
    Generates a synthetic mean-reverting (OU) freight index series.
    ASSUMPTION / SYNTHETIC: all values are simulated — not real BPI data.
    """
    warnings.warn(
        "\n*** SYNTHETIC DATA WARNING ***\n"
        "rates.csv was generated from a mean-reverting simulation (seed=42).\n"
        "Values are NOT real Baltic Panamax Index data.\n"
        "Replace with rates_raw.csv (columns: date, value) to use real data.",
        stacklevel=2,
    )
    rng = np.random.default_rng(SYNTH_SEED)
    dates = pd.bdate_range(end=pd.Timestamp.today().normalize(), periods=3 * 252)
    n = len(dates)

    vals = np.empty(n)
    vals[0] = SYNTH_MEAN
    for i in range(1, n):
        # Euler-Maruyama discretisation of OU process
        drift    = SYNTH_THETA * (SYNTH_MEAN - vals[i - 1])
        diffuse  = SYNTH_VOL * SYNTH_MEAN * rng.standard_normal()
        vals[i]  = max(vals[i - 1] + drift + diffuse, 100.0)

    df = pd.DataFrame({
        "date":        dates.strftime("%Y-%m-%d"),
        "index_value": np.round(vals, 1),
        "source":      "synthetic",
    })
    df.to_csv(out_path, index=False)
    return df


def _clean_raw(raw_path: Path, out_path: Path) -> pd.DataFrame:
    """Reads rates_raw.csv (supporting Date/Price or date/value columns) and writes standard rates.csv."""
    raw = pd.read_csv(raw_path)
    if "Date" in raw.columns and "Price" in raw.columns:
        date_col = "Date"
        val_series = raw["Price"].astype(str).str.replace(",", "").astype(float)
        date_series = pd.to_datetime(raw[date_col], format="%m/%d/%Y")
    elif "date" in raw.columns and "value" in raw.columns:
        date_col = "date"
        val_series = raw["value"].astype(float)
        date_series = pd.to_datetime(raw[date_col])
    else:
        raise ValueError("rates_raw.csv must have either ('Date', 'Price') or ('date', 'value') columns")

    df = pd.DataFrame({
        "date":        date_series.dt.strftime("%Y-%m-%d"),
        "index_value": val_series.round(1),
        "source":      "real",
    })
    df = df.dropna().sort_values("date").reset_index(drop=True)
    df.to_csv(out_path, index=False)
    return df


def ensure_rates_csv(data_dir: Path = Path(".")) -> pd.DataFrame:
    """Returns a DataFrame from rates.csv, creating it if needed."""
    raw_path = data_dir / "rates_raw.csv"
    out_path = data_dir / "rates.csv"
    if out_path.exists():
        return pd.read_csv(out_path)
    if raw_path.exists():
        return _clean_raw(raw_path, out_path)
    return _build_synthetic(out_path)

