import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingLocations, setPendingLocations] = useState([]);
  const [pendingHomestays, setPendingHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null); // { type: 'location'|'homestay', id, formData: {...} }

  useEffect(() => {
    const loadPending = async () => {
      try {
        const locationResponse = await fetch(`${API_BASE_URL}/api/pending_locations`);
        const homestayResponse = await fetch(`${API_BASE_URL}/api/pending_homestays`);

        const locationData = await locationResponse.json();
        const homestayData = await homestayResponse.json();

        setPendingLocations(locationData);
        setPendingHomestays(homestayData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPending();
  }, []);

  // Approve / Reject handlers (same as before)
  const approveLocation = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pending_locations/${id}/approve`, { method: "POST" });
      const data = await response.json();
      setPendingLocations((prev) => prev.filter((loc) => loc.id !== id));
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Approval failed.");
    }
  };

  const rejectLocation = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pending_locations/${id}/reject`, { method: "POST" });
      const data = await response.json();
      setPendingLocations((prev) => prev.filter((loc) => loc.id !== id));
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Reject failed.");
    }
  };

  const approveHomestay = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pending_homestays/${id}/approve`, { method: "POST" });
      const data = await response.json();
      setPendingHomestays((prev) => prev.filter((hs) => hs.id !== id));
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Approval failed.");
    }
  };

  const rejectHomestay = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pending_homestays/${id}/reject`, { method: "POST" });
      const data = await response.json();
      setPendingHomestays((prev) => prev.filter((hs) => hs.id !== id));
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Reject failed.");
    }
  };

  // Handle input changes in edit form
  const handleInputChange = (field, value) => {
    setEditingItem((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  // Save updated location
  const saveLocation = async () => {
    try {
      const { id, formData } = editingItem;
      const response = await fetch(`${API_BASE_URL}/api/pending_locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Update failed");
      const updatedLocation = await response.json();
      setPendingLocations((prev) => prev.map((loc) => (loc.id === id ? updatedLocation : loc)));
      setEditingItem(null);
      alert("Location updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update location");
    }
  };

  // Save updated homestay
  const saveHomestay = async () => {
    try {
      const { id, formData } = editingItem;
      const response = await fetch(`${API_BASE_URL}/api/pending_homestays/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Update failed");
      const updatedHomestay = await response.json();
      setPendingHomestays((prev) => prev.map((hs) => (hs.id === id ? updatedHomestay : hs)));
      setEditingItem(null);
      alert("Homestay updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update homestay");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Tourism Administration Panel</h1>
      <p className="text-slate-600 mb-8">Manage pending tourist locations, homestays and eco submissions.</p>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Submissions</h2>

        {loading ? (
          <p className="text-slate-500">Loading pending submissions...</p>
        ) : pendingLocations.length === 0 && pendingHomestays.length === 0 ? (
          <p className="text-slate-500">No pending submissions found.</p>
        ) : (
          <div className="space-y-4">
            {/* Locations */}
            {pendingLocations.map((location) => {
              const isEditing = editingItem?.type === "location" && editingItem.id === location.id;

              return (
                <div key={location.id} className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="font-bold text-lg">📍 Location</h3>

                  {isEditing ? (
                    <>
                      {[
                        "location_name",
                        "located_in",
                        "village_name",
                        "taluka_name",
                        "district_name",
                        "nearest_landmark",
                        "attraction_type",
                        "road_condition",
                        "signboards_available",
                        "public_transport",
                        "nearest_bus_stand",
                        "nearest_railway_station",
                        "parking_space",
                        "food_stalls",
                        "amenities_available",
                        "owned_by",
                        "managed_by",
                        "entry_fee",
                        "entry_fee_amount",
                        "visiting_hours",
                        "seasonal_availability",
                        "peak_period",
                        "avg_time_spent",
                        "visitor_type",
                        "crowd_level",
                        "site_activities",
                        "formal_regulations",
                        "local_residents_involved",
                        "job_type",
                        "suggestions_improvements",
                        "email_address",
                        "user_description",
                        "google_maps_link",
                        "latitude",
                        "longitude",
                        "photo_location",
                        "site_photos"
                      ].map((field) => (
                        <div key={field} className="mb-2">
                          <label className="block font-semibold capitalize">
                            {field.replace(/_/g, ' ')}:
                          </label>
                          <input
                            type="text"
                            value={editingItem.formData[field] ?? ""}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </div>
                      ))}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={saveLocation}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>Name:</strong> {location.location_name}</p>
                      <p><strong>Village:</strong> {location.located_in}</p>
                      <p><strong>Taluka:</strong> {location.taluka_name}</p>
                      <p><strong>Status:</strong> {location.status}</p>

                      {user?.role === "admin" && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() =>
                              setEditingItem({ type: "location", id: location.id, formData: { ...location } })
                            }
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => approveLocation(location.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectLocation(location.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Homestays */}
            {pendingHomestays.map((homestay) => {
              const isEditing = editingItem?.type === "homestay" && editingItem.id === homestay.id;

              return (
                <div key={homestay.id} className="border rounded-lg p-4 bg-slate-50 mt-4">
                  <h3 className="font-bold text-lg">🏠 Homestay</h3>

                  {isEditing ? (
                    <>
                      {[
                        "homestay_name",
                        "owner_name",
                        "phone_number",
                        "situated_in",
                        "village_town_city",
                        "taluka_name",
                        "district_name",
                        "live_on_premises",
                        "unit_type",
                        "homestay_type",
                        "discoverable_google_map",
                        "photo_homestay",
                        "registered_mtdc",
                        "accept_bookings",
                        "booking_app",
                        "listed_booking_airbnb",
                        "photo_price_list",
                        "facilities_services",
                        "digital_payments_upi",
                        "cancellation_policy",
                        "veg_meals",
                        "both_veg_nonveg",
                        "tourist_attractions",
                        "guidance_provided",
                        "guides_available",
                        "local_experiences",
                        "social_media_page",
                        "amenities_photos",
                        "google_map_link",
                        "latitude",
                        "longitude"
                      ].map((field) => (
                        <div key={field} className="mb-2">
                          <label className="block font-semibold capitalize">
                            {field.replace(/_/g, ' ')}:
                          </label>
                          <input
                            type="text"
                            value={editingItem.formData[field] ?? ""}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </div>
                      ))}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={saveHomestay}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>Name:</strong> {homestay.homestay_name}</p>
                      <p><strong>Owner:</strong> {homestay.owner_name}</p>
                      <p><strong>Village:</strong> {homestay.village_town_city}</p>
                      <p><strong>Status:</strong> {homestay.status}</p>

                      {user?.role === "admin" && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() =>
                              setEditingItem({ type: "homestay", id: homestay.id, formData: { ...homestay } })
                            }
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => approveHomestay(homestay.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectHomestay(homestay.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}