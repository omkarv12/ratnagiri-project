import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";

export default function AnalyticsDashboard() {
  const [counts, setCounts] = useState({
    locations: 0,
    homestays: 0,
    pending_locations: 0,
    pending_homestays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/counts`);
        const data = await res.json();
        setCounts({
          locations: data.locations || 0,
          homestays: data.homestays || 0,
          pending_locations: data.pending_locations || 0,
          pending_homestays: data.pending_homestays || 0,
        });
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  if (loading) return <p className="text-gray-500">Loading analytics data...</p>;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="font-semibold mb-2 text-lg">Total Locations</h3>
          <p className="text-4xl font-bold">{counts.locations}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="font-semibold mb-2 text-lg">Total Homestays</h3>
          <p className="text-4xl font-bold">{counts.homestays}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="font-semibold mb-2 text-lg">Pending Locations</h3>
          <p className="text-4xl font-bold">{counts.pending_locations}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="font-semibold mb-2 text-lg">Pending Homestays</h3>
          <p className="text-4xl font-bold">{counts.pending_homestays}</p>
        </div>
      </div>
    </section>
  );
}