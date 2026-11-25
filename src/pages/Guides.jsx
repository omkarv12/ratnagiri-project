import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import { languageName, splitCsv } from "../utils/guideLanguages";

export default function Guides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guides`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not load guides");
        if (!cancelled) setGuides(Array.isArray(data) ? data : data.guides || []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) =>
      [g.guide_name, g.destinations, g.base_village, g.taluka_name, g.languages]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [guides, query]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tourist Guides</h1>
          <p className="text-gray-600">
            Find approved local guides for Ratnagiri by language, destination or village.
          </p>
        </div>
        <Link
          to="/guides/register"
          className="px-4 py-2 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700"
        >
          Register as a Guide
        </Link>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, language, destination..."
        className="w-full sm:w-96 border rounded px-3 py-2 mb-8"
      />

      {loading && <p className="text-gray-500">Loading guides...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-500">No guides found.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <Link
            key={g.id}
            to={`/guides/${g.id}`}
            className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col"
          >
            {g.guide_photo ? (
              <img
                src={g.guide_photo}
                alt={g.guide_name}
                className="h-56 w-full object-cover bg-gray-100"
              />
            ) : (
              <div className="h-56 w-full bg-gray-100" />
            )}
            <div className="p-4 space-y-1 text-sm">
              <h2 className="font-semibold text-lg text-gray-800">{g.guide_name}</h2>
              <p className="text-gray-600">
                {[g.base_village, g.taluka_name].filter(Boolean).join(", ")}
              </p>
              <p>
                <strong>Languages:</strong>{" "}
                {splitCsv(g.languages).map(languageName).join(", ")}
              </p>
              {g.destinations && (
                <p className="truncate">
                  <strong>Destinations:</strong> {g.destinations}
                </p>
              )}
              {g.experience_years != null && (
                <p>
                  <strong>Experience:</strong> {g.experience_years} yrs
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
