import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";

const CATEGORY_COLORS = {
  beaches: "bg-orange-200 text-orange-900",
  forts: "bg-blue-200 text-blue-900",
  temples: "bg-purple-200 text-purple-900",
  waterfalls: "bg-cyan-200 text-cyan-900",
  mangoes: "bg-yellow-200 text-yellow-900",
};

const formatDate = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AdminEventsPanel() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("pending"); // pending | approved
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (s = status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/events?status=${s}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load events");
      setEvents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const act = async (id, action) => {
    if (
      action === "reject" &&
      !window.confirm("Remove this event? This can't be undone.")
    )
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/events/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Events</h2>
          <p className="text-gray-500 text-sm mt-1">
            Review events contributed through the calendar. Approved events
            appear on the public calendar.
          </p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded text-sm font-semibold capitalize ${
                status === s
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No {status} events.</p>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white p-4 rounded shadow">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-lg">📅 {ev.title}</h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                    CATEGORY_COLORS[ev.category] || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {ev.category}
                </span>
              </div>

              <p><strong>Date:</strong> {formatDate(ev.event_date)}</p>
              <p><strong>Organizer:</strong> {ev.organizer_name}</p>
              <p><strong>Phone:</strong> {ev.organizer_contact}</p>
              {ev.organizer_email && (
                <p><strong>Email:</strong> {ev.organizer_email}</p>
              )}
              {ev.description && (
                <p className="text-gray-600 mt-1">{ev.description}</p>
              )}

              {user?.role === "admin" && (
                <div className="flex gap-3 mt-4">
                  {status === "pending" && (
                    <button
                      onClick={() => act(ev.id, "approve")}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => act(ev.id, "reject")}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {status === "pending" ? "Reject" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
