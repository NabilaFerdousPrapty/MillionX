"""
flood_utils.py - code shared by train.py and api.py.

Why this file exists
--------------------
The old notebook pickled functions into the .pkl. Pickle stores functions by
*name*, so the backend could not load them. Now both training and serving
import the same module, and only data (models, scalers, JSON) is saved.

Train/serve consistency fixes
-----------------------------
* percentile features use a FIXED reference distribution (reference.json)
  instead of ranking inside whatever window happens to be loaded
* rain_anomaly uses fixed monthly means from training
* saturation_idx no longer divides by the window's own max
* elevation + slope are computed the same way for training stations and for
  arbitrary coordinates (SRTM point + 4 neighbours at ~5.5 km)
* water-level-derived features are NOT used as inputs (they were nearly the
  label)
"""
import json
import os
import threading
import time
import warnings
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd
import requests

warnings.filterwarnings("ignore")

# ----------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------
TRAIN_START = "2005-01-01"
TRAIN_END = "2022-12-31"
VAL_START = "2023-01-01"
VAL_END = "2023-12-31"

SEQUENCE_LENGTH = 30
HORIZON_DAYS = 1          # features at day t  ->  flood on day t+1
HISTORY_DAYS = 75         # needs 30 (rolling) + 30 (sequence) + margin
WARMUP_ROWS = 30          # rows dropped at the start of each station series
NASA_LAG_DAYS = 6         # NASA POWER trails real time by a few days
BD_BBOX = (20.5, 87.9, 26.7, 92.7)   # south, west, north, east
TZ = ZoneInfo("Asia/Dhaka")

DATA_DIR = Path(os.environ.get("FLOOD_DATA_DIR", "data_cache"))
WEATHER_DIR = DATA_DIR / "weather"
TERRAIN_FILE = DATA_DIR / "terrain.json"
WEATHER_DIR.mkdir(parents=True, exist_ok=True)

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
TOPO_URL = "https://api.opentopodata.org/v1/srtm30m"
METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"
NASA_PARAMS = "PRECTOTCORR,T2M_MAX,T2M_MIN,WS2M,RH2M,GWETROOT,EVPTRNS"

# Upstream catchments (outside Bangladesh). Rain here arrives 2-5 days later.
UPSTREAM_FIXED = {
    "Assam_Dhubri": {"lat": 26.022, "lon": 89.975},
    "Meghalaya_Shillong": {"lat": 25.578, "lon": 91.893},
    "Nepal_Birganj": {"lat": 27.014, "lon": 84.877},
}

_STATION_ROWS = [
    # river, district, lat, lon, elevation hint (m, used only if SRTM fails)
    ("Brahmaputra", "Kurigram", 25.807, 89.636, 12),
    ("Brahmaputra", "Gaibandha", 25.328, 89.528, 18),
    ("Jamuna", "Jamalpur", 24.937, 89.937, 15),
    ("Jamuna", "Sirajganj", 24.451, 89.701, 9),
    ("Jamuna", "Tangail", 24.251, 89.917, 11),
    ("Jamuna", "Bogura", 24.851, 89.370, 20),
    ("Teesta", "Lalmonirhat", 25.919, 89.449, 32),
    ("Atrai", "Naogaon", 24.920, 88.930, 22),
    ("Padma", "Rajshahi", 24.363, 88.601, 22),
    ("Padma", "Manikganj", 23.864, 90.000, 8),
    ("Padma", "Faridpur", 23.607, 89.843, 6),
    ("Kumar", "Magura", 23.490, 89.419, 7),
    ("Meghna", "Bhairab Bazar", 24.052, 90.978, 6),
    ("Meghna", "Chandpur", 23.232, 90.657, 4),
    ("OldBrahmaputra", "Mymensingh", 24.746, 90.407, 18),
    ("Surma", "Sunamganj", 25.069, 91.399, 3),
    ("Surma", "Sylhet", 24.899, 91.872, 30),
    ("Kongsha", "Netrokona", 24.870, 90.727, 20),
    ("Kushiyara", "Habiganj", 24.374, 91.415, 9),
    ("Buriganga", "Dhaka", 23.724, 90.408, 8),
    ("Turag", "Gazipur", 23.990, 90.369, 9),
    ("Pasur", "Khulna", 22.833, 89.533, 2),
    ("Kirtankhola", "Barishal", 22.701, 90.370, 3),
    ("Feni", "Feni", 22.916, 91.396, 7),
    ("Karnaphuli", "Chattogram", 22.341, 91.830, 10),
]
BANGLADESH_STATIONS = [
    {"name": r, "district": d, "lat": la, "lon": lo, "elev_hint": e}
    for r, d, la, lo, e in _STATION_ROWS
]

# Columns that must never be model inputs
EXCLUDE_COLS = {
    "station", "temp_max", "temp_min", "month", "doy",
    "flood_occurred", "flood_severity", "danger_thresh", "water_level_m",
    "target",
}


# ----------------------------------------------------------------------
# HTTP helper
# ----------------------------------------------------------------------
def _get_json(url, params, timeout=60, retries=4, backoff=10):
    last = None
    for attempt in range(1, retries + 1):
        try:
            r = requests.get(url, params=params, timeout=timeout)
            if r.status_code == 429 or r.status_code >= 500:
                last = f"HTTP {r.status_code}"
                time.sleep(backoff * attempt)
                continue
            r.raise_for_status()
            return r.json()
        except (requests.Timeout, requests.ConnectionError) as e:
            last = e
            time.sleep(backoff * attempt)
    raise RuntimeError(f"request failed after {retries} tries: {url} ({last})")


# ----------------------------------------------------------------------
# Terrain (elevation + slope) - identical method for training and serving
# ----------------------------------------------------------------------
OFFSET_DEG = 0.05   # ~5.5 km
_OFFSETS = [(OFFSET_DEG, 0), (-OFFSET_DEG, 0), (0, OFFSET_DEG), (0, -OFFSET_DEG)]
_terrain_lock = threading.Lock()


def _key(lat, lon):
    return f"{lat:.4f},{lon:.4f}"


def _fetch_elevations(points, cache):
    todo = [p for p in points if _key(*p) not in cache]
    for i in range(0, len(todo), 80):
        batch = todo[i:i + 80]
        locs = "|".join(f"{la:.4f},{lo:.4f}" for la, lo in batch)
        try:
            res = _get_json(TOPO_URL, {"locations": locs}, timeout=30,
                            retries=3, backoff=3)["results"]
        except Exception as e:
            print(f"  [terrain] elevation batch failed: {e}")
            return
        for p, r in zip(batch, res):
            # elevation is None over water / no-data pixels - keep that as None
            cache[_key(*p)] = r.get("elevation")
        time.sleep(1.1)   # OpenTopoData: 1 request / second


def get_terrain_many(items):
    """items: list of (lat, lon, elev_hint). Returns list of
    {'elevation_m', 'slope'} in the same order."""
    with _terrain_lock:
        cache = json.loads(TERRAIN_FILE.read_text()) if TERRAIN_FILE.exists() else {}
        pts = []
        for la, lo, _ in items:
            pts.append((la, lo))
            pts += [(la + dy, lo + dx) for dy, dx in _OFFSETS]
        _fetch_elevations(pts, cache)
        TERRAIN_FILE.parent.mkdir(parents=True, exist_ok=True)
        TERRAIN_FILE.write_text(json.dumps(cache))

    out = []
    for la, lo, hint in items:
        centre = cache.get(_key(la, lo))
        nn = [cache.get(_key(la + dy, lo + dx)) for dy, dx in _OFFSETS]
        nn = [v for v in nn if v is not None]
        if centre is not None:
            elev = float(centre)
        elif nn:
            elev = float(np.mean(nn))   # river pixels are often no-data
        else:
            elev = float(hint)
        if len(nn) >= 2:
            slope = float(np.mean([abs(v - elev) for v in nn])) / (OFFSET_DEG * 111_000)
        else:
            slope = 0.001
        out.append({"elevation_m": max(elev, 0.0), "slope": slope})
    return out


def get_terrain(lat, lon, elev_hint=10.0):
    return get_terrain_many([(lat, lon, elev_hint)])[0]


# ----------------------------------------------------------------------
# Weather
# ----------------------------------------------------------------------
def nasa_cache_path(lat, lon, start, end):
    # key includes coordinates AND dates (the old cache keyed by name only)
    return WEATHER_DIR / f"nasa_{lat:.3f}_{lon:.3f}_{start}_{end}.csv"


def fetch_nasa_power(lat, lon, start, end, use_cache=True, max_retries=3):
    """Daily NASA POWER data, start/end as 'YYYY-MM-DD'. Returns a DataFrame
    indexed by date with rainfall_mm, temp_max, temp_min, wind_speed,
    humidity, soil_moisture, evapotranspiration."""
    path = nasa_cache_path(lat, lon, start, end)
    if use_cache and path.exists():
        return pd.read_csv(path, index_col="date", parse_dates=True)

    params = {
        "parameters": NASA_PARAMS, "community": "AG",
        "longitude": lon, "latitude": lat,
        "start": start.replace("-", ""), "end": end.replace("-", ""),
        "format": "JSON",
    }
    data = _get_json(NASA_POWER_URL, params, timeout=120,
                     retries=max_retries, backoff=15)
    p = data["properties"]["parameter"]
    keys = list(p["PRECTOTCORR"].keys())
    dates = pd.to_datetime(keys, format="%Y%m%d")

    def col(name):
        arr = np.array([p.get(name, {}).get(k, np.nan) for k in keys], dtype=float)
        arr[arr <= -998] = np.nan
        return arr

    df = pd.DataFrame({
        "date": dates,
        "rainfall_mm": col("PRECTOTCORR"),
        "temp_max": col("T2M_MAX"),
        "temp_min": col("T2M_MIN"),
        "wind_speed": col("WS2M"),
        "humidity": col("RH2M"),
        "soil_moisture": col("GWETROOT"),
        "evapotranspiration": col("EVPTRNS"),
    }).set_index("date").sort_index()

    df = df.dropna(subset=["rainfall_mm"])     # drop not-yet-available days
    df = df.ffill().bfill()
    if df.empty:
        raise RuntimeError("NASA POWER returned no usable rows")
    if use_cache:
        df.to_csv(path)
    return df


def fetch_openmeteo_daily(lat, lon, past_days=10, forecast_days=7):
    data = _get_json(METEO_FORECAST, {
        "latitude": lat, "longitude": lon,
        "daily": "precipitation_sum,precipitation_probability_max",
        "past_days": past_days, "forecast_days": forecast_days,
        "timezone": "Asia/Dhaka",
    }, timeout=30, retries=3, backoff=3)
    d = data["daily"]
    return pd.DataFrame({
        "date": pd.to_datetime(d["time"]),
        "rainfall_mm": pd.to_numeric(pd.Series(d["precipitation_sum"]), errors="coerce"),
        "rain_probability": pd.to_numeric(
            pd.Series(d.get("precipitation_probability_max", [None] * len(d["time"]))),
            errors="coerce"),
    }).set_index("date")


def fetch_recent_weather(lat, lon):
    """History up to yesterday + forecast.

    NASA POWER (same source as training) covers everything up to a few days ago.
    The remaining gap is filled with Open-Meteo *rainfall only*; other columns
    are carried forward. Returns (history_df, forecast_df).
    """
    today = datetime.now(TZ).date()
    start = today - timedelta(days=HISTORY_DAYS)
    nasa_end = today - timedelta(days=NASA_LAG_DAYS)

    hist, err = None, None
    for extra in (0, 3, 7):          # step back if NASA has not published yet
        try:
            end = (nasa_end - timedelta(days=extra)).isoformat()
            hist = fetch_nasa_power(lat, lon, start.isoformat(), end, use_cache=False)
            break
        except Exception as e:
            err = e
    if hist is None:
        raise RuntimeError(f"NASA POWER unavailable: {err}")

    om = fetch_openmeteo_daily(lat, lon, past_days=NASA_LAG_DAYS + 7, forecast_days=7)
    last = hist.index.max()
    gap = om.loc[(om.index > last) & (om.index < pd.Timestamp(today)), ["rainfall_mm"]]
    gap = gap.fillna(0.0)
    if len(gap):
        hist = pd.concat([hist, gap]).sort_index().ffill()
    forecast = om.loc[om.index >= pd.Timestamp(today)]
    return hist, forecast


# ----------------------------------------------------------------------
# Reference distributions (built once from TRAINING data, reused at serving)
# ----------------------------------------------------------------------
def antecedent_precip(rain):
    """API_t = sum_{i=0..29} 0.5^i * rain_{t-1-i}  (vectorised, same as the loop)."""
    rain = np.asarray(rain, dtype=float)
    conv = np.convolve(rain, 0.5 ** np.arange(30))[: len(rain)]
    out = np.zeros(len(rain))
    out[1:] = conv[:-1]
    return out


def _grid(values):
    return np.quantile(np.asarray(values, float), np.linspace(0, 1, 1001)).tolist()


def pct_rank(values, grid):
    """Percentile (0-1) of values against a fixed quantile grid."""
    return np.searchsorted(np.asarray(grid), np.asarray(values, float), side="right") / len(grid)


def build_reference(raw_station_dfs, upstream_dfs, train_end=TRAIN_END):
    r7, r14, api, monthly = [], [], [], []
    for df in raw_station_dfs:
        rain = df.loc[:train_end, "rainfall_mm"].fillna(0)
        r7.append(rain.rolling(7).sum().dropna().values)
        r14.append(rain.rolling(14).sum().dropna().values)
        api.append(antecedent_precip(rain.values)[WARMUP_ROWS:])
        monthly.append(rain)
    monthly = pd.concat(monthly)
    mm = monthly.groupby(monthly.index.month).mean()

    up_p95 = {}
    for name, df in upstream_dfs.items():
        short = name.split("_")[0][:5]
        s7 = df.loc[:train_end, "rainfall_mm"].fillna(0).rolling(7).sum().dropna()
        up_p95[f"up_{short}_7d_sum"] = float(np.percentile(s7, 95))

    return {
        "rain7_grid": _grid(np.concatenate(r7)),
        "rain14_grid": _grid(np.concatenate(r14)),
        "api_grid": _grid(np.concatenate(api)),
        "monthly_rain_mean": {str(m): float(v) for m, v in mm.items()},
        "up_p95": up_p95,
    }


# ----------------------------------------------------------------------
# Features
# ----------------------------------------------------------------------
def compute_physics_features(df, elevation_m, slope, ref):
    """Physics + rainfall features. Uses only rainfall/weather/terrain, so it
    works identically for training stations and arbitrary coordinates."""
    df = df.copy().sort_index()
    rain = df["rainfall_mm"].fillna(0)
    if "soil_moisture" in df:
        df["soil_moisture"] = df["soil_moisture"].ffill().fillna(0.5)
    else:
        df["soil_moisture"] = 0.5

    new = {}
    low = 1.0 / (1.0 + elevation_m / 15.0)
    flat = 1.0 / (1.0 + slope * 5000.0)
    fsi = low * flat
    new["elevation_m"] = elevation_m
    new["low_elev_score"] = low
    new["slope"] = slope
    new["flat_land_score"] = flat
    new["flood_susceptibility_idx"] = fsi

    api = antecedent_precip(rain.values)
    r7 = rain.rolling(7).sum()
    r14 = rain.rolling(14).sum()
    pct_r7 = pct_rank(r7.fillna(0).values, ref["rain7_grid"])
    pct_r14 = pct_rank(r14.fillna(0).values, ref["rain14_grid"])
    pct_api = pct_rank(api, ref["api_grid"])

    new["antecedent_precip_idx"] = api
    new["pct_rain_7d"] = pct_r7
    new["pct_rain_14d"] = pct_r14
    new["pct_api"] = pct_api
    new["saturation_idx"] = np.clip(0.6 * df["soil_moisture"].values + 0.4 * pct_r14, 0, 1)

    mm = np.array([ref["monthly_rain_mean"][str(m)] for m in df.index.month])
    new["rain_anomaly"] = np.clip(rain.values / (mm + 1.0), 0, 20)

    for w in (3, 5, 7, 14, 30):
        roll = rain.rolling(w)
        new[f"rain_{w}d_sum"] = roll.sum()
        new[f"rain_{w}d_max"] = roll.max()
        new[f"rain_{w}d_mean"] = roll.mean()
    for lag in (1, 2, 3, 5, 7, 10, 14):
        new[f"rain_lag{lag}d"] = rain.shift(lag)

    month = df.index.month.values
    doy = df.index.dayofyear.values.astype(float)
    new["month_sin"] = np.sin(2 * np.pi * month / 12)
    new["month_cos"] = np.cos(2 * np.pi * month / 12)
    new["doy_sin"] = np.sin(2 * np.pi * doy / 365)
    new["doy_cos"] = np.cos(2 * np.pi * doy / 365)
    raw_dist = np.abs(doy - 213)
    new["days_from_monsoon_peak"] = np.minimum(raw_dist, 365 - raw_dist)

    new["temp_range"] = (df["temp_max"] - df["temp_min"]).values

    # month-agnostic composite (no water level: it was leaking the label)
    new["climate_shock_idx"] = (0.50 * pct_r7 + 0.30 * pct_api
                                + 0.10 * pct_r14 + 0.10 * min(fsi, 1.0))

    return pd.concat([df, pd.DataFrame(new, index=df.index)], axis=1)


def add_upstream_features(feat_df, upstream_dfs):
    new = {}
    for name, up in upstream_dfs.items():
        short = name.split("_")[0][:5]
        up_rain = up["rainfall_mm"].reindex(feat_df.index, method="nearest")
        for lag in (2, 3, 4, 5, 7):
            new[f"up_{short}_lag{lag}d"] = up_rain.shift(lag)
        new[f"up_{short}_7d_sum"] = up_rain.rolling(7).sum()
    if not new:
        return feat_df
    return pd.concat([feat_df, pd.DataFrame(new, index=feat_df.index)], axis=1)


# ----------------------------------------------------------------------
# Risk score + levels
# ----------------------------------------------------------------------
def dynamic_risk_score(row, ref):
    """0-1 score from the latest feature row (pandas Series) compared with the
    FIXED training reference."""
    ups = []
    for col, p95 in ref.get("up_p95", {}).items():
        if col in row.index:
            ups.append(min(float(row[col]) / max(p95, 1e-6), 1.0))
    c_up = float(np.mean(ups)) if ups else 0.5 * float(row["pct_rain_7d"])
    score = (0.35 * row["pct_rain_7d"]
             + 0.20 * row["pct_api"]
             + 0.15 * row["saturation_idx"]
             + 0.15 * c_up
             + 0.15 * min(row["flood_susceptibility_idx"], 1.0))
    return float(np.clip(score, 0, 1))


def risk_level_from_score(score):
    if score < 0.20:
        return "SAFE"
    if score < 0.45:
        return "WATCH"
    if score < 0.68:
        return "WARNING"
    if score < 0.85:
        return "DANGER"
    return "EXTREME"


# ----------------------------------------------------------------------
# Training-only helpers (labels, weights, scaling)
# ----------------------------------------------------------------------
def simulate_water_level(df, elevation_m, train_end=TRAIN_END):
    """SYNTHETIC label generator - replace with real BWDB/FFWC gauge data or
    flood-event records when you have them. The danger threshold is computed
    on the training period only."""
    rng = np.random.RandomState(abs(int(elevation_m * 100)) % (2**31 - 1))
    n = len(df)
    doy = df.index.dayofyear.values
    seasonal = 2.0 + 1.8 * np.sin(2 * np.pi * (doy - 80) / 365)
    rain = df["rainfall_mm"].fillna(0).values
    lagged = np.zeros(n)
    for lag, w in [(2, 0.35), (3, 0.40), (4, 0.15), (5, 0.10)]:
        lagged += w * np.pad(rain, (lag, 0), mode="constant")[:n]
    mx = lagged.max()
    if mx > 0:
        lagged = lagged / mx * (5.0 / (1.0 + elevation_m / 10.0))
    wl = seasonal + lagged + rng.normal(0, 0.15, n)
    train_mask = df.index <= pd.Timestamp(train_end)
    thresh = float(np.percentile(wl[train_mask], 85))
    out = df.copy()
    out["flood_occurred"] = (wl > thresh).astype(int)
    return out


def temporal_sample_weights(index):
    year = np.asarray(index.year)
    w = np.ones(len(year), dtype=np.float32)
    w[year < 2010] = 0.85
    return w


def scale(scaler, X):
    """Scale and clip to [0, 1] so unseen extremes cannot blow up the LSTM."""
    return np.clip(scaler.transform(X), 0.0, 1.0).astype(np.float32)