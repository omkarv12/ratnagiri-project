// src/components/VisitorCounter.jsx
import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";

// Backend-free visitor counter using CountAPI's free hit-counter service.
// Note: CountAPI is a third-party free tier, so it can occasionally be slow
// or down — this component fails silently (returns null) in that case.
// For a reliable long-term count, replace COUNTER_URL with a call to your
// own Flask endpoint (e.g. GET /api/visits) that increments a row in Postgres.
const COUNTER_URL = "https://api.countapi.xyz/hit/ratnagiri-tourism/site-visits";

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (target == null) return;
    startRef.current = null;
    let frame;
    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function VisitorCounter({ className = "" }) {
  const [count, setCount] = useState(null);
  const [failed, setFailed] = useState(false);
  const animated = useCountUp(count);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTER_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Counter unavailable");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && typeof data?.value === "number") setCount(data.value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#5EEAD4]">
        <Users size={16} />
      </span>
      <div className="leading-tight">
        <p className="font-display text-lg font-bold text-white tabular-nums">
          {count === null ? "—" : animated.toLocaleString("en-IN")}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          Visitors so far
        </p>
      </div>
    </div>
  );
}