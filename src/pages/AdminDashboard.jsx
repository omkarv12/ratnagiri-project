import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";
import AnalyticsDashboard from "./AnalyticsDashboard";
import AdminBlogForm from "../src/components/forms/AdminBlogForm";
import { blogApi } from "../api/Blogapi";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pendingSubmissions");
  const [pendingLocations, setPendingLocations] = useState([]);
  const [pendingHomestays, setPendingHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  // --- Stories (blog) state ---
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogFormMode, setBlogFormMode] = useState(null); // null | "new" | blog object being edited
  const [blogActionError, setBlogActionError] = useState(null);

  useEffect(() => {
    async function loadPending() {
      try {
        const locRes = await fetch(`${API_BASE_URL}/api/pending_locations`);
        const hsRes = await fetch(`${API_BASE_URL}/api/pending_homestays`);
        const locData = await locRes.json();
        const hsData = await hsRes.json();
        setPendingLocations(locData);
        setPendingHomestays(hsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPending();
  }, []);

  // Load stories once the Itineraries & Stories tab is opened
  useEffect(() => {
    if (activeTab === "addEditItineraries") {
      loadBlogs();
    }
  }, [activeTab]);

  const loadBlogs = async () => {
    setBlogsLoading(true);
    setBlogActionError(null);
    try {
      const data = await blogApi.adminListBlogs();
      setBlogPosts(data);
    } catch (err) {
      setBlogActionError(err.message);
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleBlogSaved = () => {
    setBlogFormMode(null);
    loadBlogs();
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Delete this story? This can't be undone.")) return;
    try {
      await blogApi.adminDeleteBlog(id);
      setBlogPosts((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setBlogActionError(err.message);
    }
  };

  const toggleBlogStatus = async (blog) => {
    const nextStatus = blog.status === "published" ? "draft" : "published";
    try {
      await blogApi.adminUpdateBlog(blog.id, { ...blog, category_id: blog.category?.id, status: nextStatus });
      setBlogPosts((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, status: nextStatus } : b))
      );
    } catch (err) {
      setBlogActionError(err.message);
    }
  };

  const approveLocation = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pending_locations/${id}/approve`, { method: "POST" });
      const data = await res.json();
      setPendingLocations((prev) => prev.filter((loc) => loc.id !== id));
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Approval failed.");
    }
  };

  const rejectLocation = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pending_locations/${id}/reject`, { method: "POST" });
      const data = await res.json();
      setPendingLocations((prev) => prev.filter((loc) => loc.id !== id));
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Reject failed.");
    }
  };

  const approveHomestay = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pending_homestays/${id}/approve`, { method: "POST" });
      const data = await res.json();
      setPendingHomestays((prev) => prev.filter((hs) => hs.id !== id));
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Approval failed.");
    }
  };

  const rejectHomestay = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pending_homestays/${id}/reject`, { method: "POST" });
      const data = await res.json();
      setPendingHomestays((prev) => prev.filter((hs) => hs.id !== id));
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Reject failed.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditingItem((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  const saveLocation = async () => {
    try {
      const { id, formData } = editingItem;
      const res = await fetch(`${API_BASE_URL}/api/pending_locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedLocation = await res.json();
      setPendingLocations((prev) => prev.map((loc) => (loc.id === id ? updatedLocation : loc)));
      setEditingItem(null);
      alert("Location updated successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to update location");
    }
  };

  const saveHomestay = async () => {
    try {
      const { id, formData } = editingItem;
      const res = await fetch(`${API_BASE_URL}/api/pending_homestays/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedHomestay = await res.json();
      setPendingHomestays((prev) => prev.map((hs) => (hs.id === id ? updatedHomestay : hs)));
      setEditingItem(null);
      alert("Homestay updated successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to update homestay");
    }
  };

  const menuItems = [
    { key: "analytics", label: "Analytics" },
    { key: "pendingSubmissions", label: "Pending Submissions" },
    { key: "addEditItineraries", label: "Itineraries & Stories" },
  ];

  return (
    <div className="flex min-h-screen m-0 p-0 w-full h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-black text-white flex flex-col p-4">
        <div className="mb-8">
          <p className="text-sm opacity-70">Hello,</p>
          <p className="text-lg font-semibold truncate max-w-full">{user?.email || "User"}</p>
        </div>

        <nav className="flex flex-col gap-4">
          {menuItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-left px-4 py-2 rounded transition-colors duration-200 ${
                activeTab === key ? "bg-blue-600 font-semibold" : "hover:bg-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-grow bg-gray-50 p-6 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tourism Administration Panel</h1>
        <p className="text-gray-600 mb-8">Manage pending tourist locations, homestays and eco submissions.</p>

        {activeTab === "analytics" && <AnalyticsDashboard />}

        {activeTab === "pendingSubmissions" && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Pending Submissions</h2>

            {loading ? (
              <p className="text-gray-500">Loading pending submissions...</p>
            ) : pendingLocations.length === 0 && pendingHomestays.length === 0 ? (
              <p className="text-gray-500">No pending submissions found.</p>
            ) : (
              <div className="space-y-6">
                {pendingLocations.map((location) => {
                  const isEditing = editingItem?.type === "location" && editingItem.id === location.id;

                  return (
                    <div key={location.id} className="bg-white p-4 rounded shadow">
                      <h3 className="font-semibold text-lg mb-2">📍 Location: {location.location_name}</h3>

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
                              <label className="block font-semibold capitalize">{field.replace(/_/g, ' ')}:</label>
                              <input
                                type="text"
                                value={editingItem.formData[field] ?? ""}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                              />
                            </div>
                          ))}
                          <div className="flex gap-3 mt-4">
                            <button onClick={saveLocation} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                              Save
                            </button>
                            <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
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

                {pendingHomestays.map((homestay) => {
                  const isEditing = editingItem?.type === "homestay" && editingItem.id === homestay.id;

                  return (
                    <div key={homestay.id} className="bg-white p-4 rounded shadow">
                      <h3 className="font-semibold text-lg mb-2">🏠 Homestay: {homestay.homestay_name}</h3>

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
                              <label className="block font-semibold capitalize">{field.replace(/_/g, ' ')}:</label>
                              <input
                                type="text"
                                value={editingItem.formData[field] ?? ""}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                              />
                            </div>
                          ))}
                          <div className="flex gap-3 mt-4">
                            <button onClick={saveHomestay} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                              Save
                            </button>
                            <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
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
          </section>
        )}

        {activeTab === "addEditItineraries" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Add / Edit Itineraries</h2>
            <p className="text-gray-500 mb-8">This section will allow you to add or edit itineraries.</p>

            {/* --- Stories / Blog management --- */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-semibold">Stories</h2>
                {!blogFormMode && (
                  <button
                    onClick={() => setBlogFormMode("new")}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-semibold"
                  >
                    + Write New Story
                  </button>
                )}
              </div>

              {blogActionError && (
                <p className="text-sm text-red-500 mb-4">{blogActionError}</p>
              )}

              {blogFormMode && (
                <div className="bg-white p-5 rounded shadow mb-8">
                  <AdminBlogForm
                    existingBlog={blogFormMode === "new" ? null : blogFormMode}
                    onSaved={handleBlogSaved}
                    onCancel={() => setBlogFormMode(null)}
                  />
                </div>
              )}

              {blogsLoading ? (
                <p className="text-gray-500">Loading stories...</p>
              ) : blogPosts.length === 0 ? (
                <p className="text-gray-500">No stories yet. Write your first one above.</p>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((blog) => (
                    <div key={blog.id} className="bg-white p-4 rounded shadow flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-lg">{blog.title}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                            blog.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                          }`}>
                            {blog.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {blog.category?.name || "No category"} · {blog.comment_count} comments · {blog.views} views
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setBlogFormMode(blog)}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleBlogStatus(blog)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          {blog.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}