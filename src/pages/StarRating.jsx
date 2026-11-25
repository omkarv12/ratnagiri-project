import React, { useState } from "react";
import { Star } from "lucide-react";

const GOLD = "#e8a317";

/** Read-only stars. value can be decimal (4.3) - the last star is filled partially. */
export function Stars({ value = 0, size = 16 }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-gray-300" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} style={{ color: GOLD }} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Clickable 1-5 stars for the review form. */
export function StarInput({ value, onChange, size = 30 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="inline-flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b0a30]"
        >
          <Star size={size} fill={n <= shown ? GOLD : "none"} style={{ color: n <= shown ? GOLD : "#9ca3af" }} />
        </button>
      ))}
    </div>
  );
}
