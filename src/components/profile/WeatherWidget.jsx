import { useState, useEffect } from "react";
import { CloudRain, Sun, Cloud, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, AlertTriangle } from "lucide-react";

// Maps Open-Meteo's WMO weather codes to a label + icon.
// https://open-meteo.com/en/docs (see "Weather variable documentation")
const WMO_MAP = {
  0: { label: "Clear sky", icon: Sun },
  1: { label: "Mainly clear", icon: Sun },
  2: { label: "Partly cloudy", icon: Cloud },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Fog", icon: CloudFog },
  48: { label: "Fog", icon: CloudFog },
  51: { label: "Light drizzle", icon: CloudDrizzle },
  53: { label: "Drizzle", icon: CloudDrizzle },
  55: { label: "Dense drizzle", icon: CloudDrizzle },
  61: { label: "Light rain", icon: CloudRain },
  63: { label: "Rain", icon: CloudRain },
  65: { label: "Heavy rain", icon: CloudRain },
  71: { label: "Light snow", icon: CloudSnow },
  73: { label: "Snow", icon: CloudSnow },
  75: { label: "Heavy snow", icon: CloudSnow },
  80: { label: "Rain showers", icon: CloudRain },
  81: { label: "Rain showers", icon: CloudRain },
  82: { label: "Violent showers", icon: CloudRain },
  95: { label: "Thunderstorm", icon: CloudLightning },
  96: { label: "Thunderstorm w/ hail", icon: CloudLightning },
  99: { label: "Thunderstorm w/ hail", icon: CloudLightning },
};

function describeCode(code) {
  return WMO_MAP[code] || { label: "Unknown", icon: Cloud };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * WeatherWidget
 * Shows current conditions + 5-day precipitation outlook for a location.
 * Drop this in ProfileDetails.jsx wherever `loc.lat`/`loc.lng`
 * (or `loc.latitude`/`loc.longitude`) are available.
 *
 * Usage:
 *   <WeatherWidget lat={loc.lat} lng={loc.lng} />
 */
export default function WeatherWidget({ lat, lng, compact = false }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    async function fetchWeather() {
      try {
        setLoading(true);
        setError(false);

        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
          `&current=temperature_2m,weather_code` +
          `&daily=weather_code,temperature_2m_max,precipitation_probability_max` +
          `&timezone=auto&forecast_days=5`;

        const res = await fetch(url);
        const data = await res.json();

        if (!cancelled) {
          setWeather(data);
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-20 bg-slate-200 rounded" />
      </div>
    );
  }

  if (error || !weather) {
    return null; // fail silently — don't block the rest of the profile
  }

  const current = weather.current;
  const daily = weather.daily;
  const { label: currentLabel, icon: CurrentIcon } = describeCode(current.weather_code);
  const todayRainChance = daily.precipitation_probability_max[0];
  const showCaution = todayRainChance >= 60;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      {/* Current conditions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
            <CurrentIcon size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-800">
              {Math.round(current.temperature_2m)}°C · {currentLabel}
            </div>
            <div className="text-xs text-slate-500">Today's conditions</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase font-bold">Rain chance</div>
          <div className={`font-bold ${todayRainChance >= 60 ? "text-red-600" : "text-slate-700"}`}>
            {todayRainChance}%
          </div>
        </div>
      </div>

      {/* Caution banner */}
      {showCaution && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mb-4">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            Heavy rain expected today — check road conditions before travelling, especially on hill or forest routes.
          </span>
        </div>
      )}

      {/* 5-day strip */}
      <div className={`grid grid-cols-5 gap-2 ${compact ? "text-[10px]" : "text-xs"}`}>
        {daily.time.map((date, idx) => {
          const dayIdx = new Date(date).getDay();
          const { icon: DayIcon } = describeCode(daily.weather_code[idx]);
          const rain = daily.precipitation_probability_max[idx];
          return (
            <div
              key={date}
              className="flex flex-col items-center gap-1 bg-white rounded-lg border border-slate-200 py-2"
            >
              <span className="font-bold text-slate-600">{DAY_LABELS[dayIdx]}</span>
              <DayIcon size={16} className="text-slate-500" />
              <span className="font-semibold text-slate-700">{Math.round(daily.temperature_2m_max[idx])}°</span>
              <span className={rain >= 60 ? "text-red-600 font-bold" : "text-slate-400"}>{rain}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
