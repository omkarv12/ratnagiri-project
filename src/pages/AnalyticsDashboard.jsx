// File: AnalyticsDashboard.jsx

import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";

export default function AnalyticsDashboard() {
  const [pendingLocationsCount, setPendingLocationsCount] = useState(0);
  const [pendingHomestaysCount, setPendingHomestaysCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const locRes = await fetch(`${API_BASE_URL}/api/pending_locations`);
        const hsRes = await fetch(`${API_BASE_URL}/api/pending_homestays`);
        const locData = await locRes.json();
        const hsData = await hsRes.json();

        setPendingLocationsCount(Array.isArray(locData) ? locData.length : 0);
        setPendingHomestaysCount(Array.isArray(hsData) ? hsData.length : 0);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>

      {loading ? (
        <p className="text-gray-500">Loading analytics data...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="font-semibold mb-2 text-lg">Pending Locations</h3>
            <p className="text-4xl font-bold">{pendingLocationsCount}</p>
          </div>

          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="font-semibold mb-2 text-lg">Pending Homestays</h3>
            <p className="text-4xl font-bold">{pendingHomestaysCount}</p>
          </div>

          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="font-semibold mb-2 text-lg">Total Pending Submissions</h3>
            <p className="text-4xl font-bold">{pendingLocationsCount + pendingHomestaysCount}</p>
          </div>
        </div>
      )}
    </section>
  );
}