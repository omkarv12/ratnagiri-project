import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingLocations, setPendingLocations] = useState([]);
  const [pendingHomestays, setPendingHomestays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track editing item: { type, id, formData }
  const [editingItem, setEditingItem] = useState(null);

  // Fetch data as before (omitted here for brevity)...

  // Approve/Reject functions remain the same (omitted for brevity)...

  // Save updated location
  const saveLocation = async () => {
    try {
      const { id, formData } = editingItem;

      const response = await fetch(`${API_BASE_URL}/api/pending_locations/${id}`, {
        method: "PUT", // Assuming PUT for update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Update failed");

      const updatedLocation = await response.json();

      setPendingLocations((prev) =>
        prev.map((loc) => (loc.id === id ? updatedLocation : loc))
      );

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

      setPendingHomestays((prev) =>
        prev.map((hs) => (hs.id === id ? updatedHomestay : hs))
      );

      setEditingItem(null);
      alert("Homestay updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update homestay");
    }
  };

  // Handle input change in edit form
  const handleInputChange = (field, value) => {
    setEditingItem((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Tourism Administration Panel
      </h1>

      <p className="text-slate-600 mb-8">
        Manage pending tourist locations, homestays and eco submissions.
      </p>

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
              const isEditing =
                editingItem?.type === "location" && editingItem.id === location.id;

              return (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 bg-slate-50"
                >
                  <h3 className="font-bold text-lg">📍 Location</h3>

                  {isEditing ? (
                    <>
                      <label>
                        Name:
                        <input
                          type="text"
                          value={editingItem.formData.location_name}
                          onChange={(e) =>
                            handleInputChange("location_name", e.target.value)
                          }
                          className="border px-2 py-1 ml-2 rounded"
                        />
                      </label>
                      <br />
                      <label>
                        Village:
                        <input
                          type="text"
                          value={editingItem.formData.located_in}
                          onChange={(e) =>
                            handleInputChange("located_in", e.target.value)
                          }
                          className="border px-2 py-1 ml-2 rounded"
                        />
                      </label>
                      <br />
                      <label>
                        Taluka:
                        <input
                          type="text"
                          value={editingItem.formData.taluka_name}
                          onChange={(e) =>
                            handleInputChange("taluka_name", e.target.value)
                          }
                          className="border px-2 py-1 ml-2 rounded"
                        />
                      </label>
                      <br />
                      {/* Add other fields similarly */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={saveLocation}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Name:</strong> {location.location_name}
 </p>

                      <p>
                        <strong>Village:</strong> {location.located_in}
                      </p>

                      <p>
                        <strong>Taluka:</strong> {location.taluka_name}
                      </p>

                      <p>
                        <strong>Status:</strong> {location.status}
                      </p>

                      {user?.role === "admin" && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() =>
                              setEditingItem({
                                type: "location",
                                id: location.id,
                                formData: { ...location },
                              })
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
              const isEditing =
                editingItem?.type === "homestay" && editingItem.id === homestay.id;

              return (
                <div
                  key={homestay.id}
                  className="border rounded-lg p-4 bg-slate-50 mt-4"
                >
                  <h3 className="font-bold text-lg">🏠 Homestay</h3>

                  {isEditing ? (
                    <>
                      <label>
                        Name:
                        <input
                          type="text"
                          value={editingItem.formData.homestay_name}
                          onChange={(e) =>
                            handleInputChange("homestay_name", e.target.value)
                          }
                          className="border px-2 py-1 ml-2 rounded"
                        />
                      </label>
                      <br />
                      <label>
                        Owner:
                        <input
                          type="text"
                          value={editingItem.formData.owner_name}
                          onChange={(e) =>
                            handleInputChange("owner_name", e.target.value)
                          }
                          className="border px-2 py-1 ml-2 rounded"
                        />
                      </label>
                      <br />
                      <label>
                        Village:
                        <input
                          type="text"
                          value={editingItem.formData.village_town_city}
                          onChange={(e) =>
                            handleInputChange("village_town_city", e.target.value)
                          }
                          className="border px-2 py-1 ml-2 rounded"
                        />
                      </label>
 <br />
                      {/* Add other fields similarly */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={saveHomestay}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Name:</strong> {homestay.homestay_name}
                      </p>

                      <p>
                        <strong>Owner:</strong> {homestay.owner_name}
                      </p>

                      <p>
                        <strong>Village:</strong> {homestay.village_town_city}
                      </p>

                      <p>
                        <strong>Status:</strong> {homestay.status}
                      </p>

                      {user?.role === "admin" && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() =>
                              setEditingItem({
                                type: "homestay",
                                id: homestay.id,
                                formData: { ...homestay },
                              })
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