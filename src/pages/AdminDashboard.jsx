import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Inbox,
  BookOpen,
  Landmark,
  CalendarDays,
  Compass,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  Drama,
  Trees,
  Map as MapIcon,
  Route as RouteIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";
import AnalyticsDashboard from "./AnalyticsDashboard";
import AdminBlogForm from "../components/forms/AdminBlogForm";
import AdminVillageProfileForm from "../components/forms/AdminVillageProfileForm";
import AdminEventsPanel from "../components/AdminEventsPanel";
import AdminExperiencesPanel from "../components/AdminExperiencesPanel";
import AdminDataManager from "../components/Admindatamanager";
import AdminHiddenPathsPanel from "../components/AdminHiddenPathsPanel";
import AdminExploreVillagesPanel from "../components/AdminExploreVillagesPanel";
import AdminItinerariesPanel from "../components/AdminItinerariesPanel";
import AdminCircuitsPanel from "../components/AdminCircuitsPanel";
import { blogApi, adminListVillageProfiles } from "../api/blogApi";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("pendingSubmissions");
  const [pendingLocations, setPendingLocations] = useState([]);
  const [pendingHomestays, setPendingHomestays] = useState([]);
  const [pendingPathsCount, setPendingPathsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  // --- Stories (blog) state ---
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogFormMode, setBlogFormMode] = useState(null); // null | "new" | blog object being edited
  const [blogActionError, setBlogActionError] = useState(null);

  // --- Village profiles state ---
  const [villageProfiles, setVillageProfiles] = useState([]);
  const [villageProfilesLoading, setVillageProfilesLoading] = useState(true);
  const [villageFormOpen, setVillageFormOpen] = useState(false);
  const [villageActionError, setVillageActionError] = useState(null);

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
      }

      // Pending hidden paths count (badge only; a failure here must not break the page)
      try {
        const r = await fetch(`${API_BASE_URL}/api/admin/hidden-paths?status=pending`);
        const d = await r.json();
        setPendingPathsCount(d.counts?.pending || 0);
      } catch { /* badge optional */ }

      setLoading(false);
    }
    loadPending();
  }, []);

  // Load stories once the Itineraries & Stories tab is opened
  useEffect(() => {
    if (activeTab === "addEditItineraries") {
      loadBlogs();
    }
  }, [activeTab]);

  // Load village profiles once that tab is opened
  useEffect(() => {
    if (activeTab === "villageProfiles") {
      loadVillageProfiles();
    }
  }, [activeTab]);

  const loadVillageProfiles = async () => {
    setVillageProfilesLoading(true);
    setVillageActionError(null);
    try {
      const data = await adminListVillageProfiles();
      setVillageProfiles(data);
    } catch (err) {
      setVillageActionError(err.message);
    } finally {
      setVillageProfilesLoading(false);
    }
  };

  const handleVillageProfileSaved = () => {
    setVillageFormOpen(false);
    loadVillageProfiles();
  };

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

  const pendingCount = loading ? 0 : pendingLocations.length + pendingHomestays.length;

  const menuGroups = [
    {
      label: "Overview",
      items: [{ key: "analytics", label: "Analytics", icon: BarChart3 }],
    },
    {
      label: "Review",
      items: [
        { key: "pendingSubmissions", label: "Pending Submissions", icon: Inbox, badge: pendingCount },
        { key: "hiddenPaths", label: "Hidden Paths", icon: RouteIcon, badge: pendingPathsCount },
      ],
    },
    {
      label: "Manage",
      items: [{ key: "manageData", label: "Manage Data", icon: Database }],
    },
    {
      label: "Content",
      items: [
        { key: "addEditItineraries", label: "Itineraries & Stories", icon: BookOpen },
        { key: "circuits", label: "Circuits", icon: MapIcon },
        { key: "villageProfiles", label: "Village Profiles", icon: Landmark },
        { key: "exploreVillages", label: "Explore Villages", icon: Trees },
        { key: "localExperiences", label: "Local Experiences", icon: Drama },
        { key: "events", label: "Events", icon: CalendarDays },
      ],
    },
  ];

  const displayName = user?.name || user?.email || "User";
  const initials = (() => {
    const base = (user?.name || user?.email || "U").split("@")[0];
    const parts = base.split(/[\s._-]+/).filter(Boolean);
    return ((parts[0]?.[0] || "U") + (parts[1]?.[0] || "")).toUpperCase();
  })();
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin";

  return (
    <div className="flex w-full items-start">
      {/* Sidebar (sticky: stays below the site navbar, doesn't overlap content) */}
      <aside
        className={`sticky top-0 self-start h-screen shrink-0 flex flex-col bg-[#0c2a2e] text-slate-300 border-r border-white/5 transition-[width] duration-200 ${
          sidebarCollapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {/* Brand + collapse toggle */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid place-items-center h-9 w-9 shrink-0 rounded-lg bg-teal-500 text-white">
                <Compass size={20} />
              </span>
              <span className="font-semibold text-white truncate">Tourism Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid place-items-center h-9 w-9 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed ? (
                <p className="px-3 mb-1.5 text-xs font-medium text-slate-500">{group.label}</p>
              ) : (
                <div className="mx-3 mb-2 border-t border-white/10" />
              )}
              <div className="space-y-1">
                {group.items.map(({ key, label, icon: Icon, badge }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      title={sidebarCollapsed ? label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`relative w-full flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        sidebarCollapsed ? "justify-center px-0" : "px-3"
                      } ${
                        active
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-orange-500" />
                      )}
                      <Icon size={19} className={active ? "text-teal-300" : "text-slate-400"} />
                      {!sidebarCollapsed && <span className="truncate text-left flex-1">{label}</span>}
                      {badge > 0 && (
                        <span
                          className={
                            sidebarCollapsed
                              ? "absolute top-1.5 right-3 h-2.5 w-2.5 rounded-full bg-orange-500"
                              : "ml-auto min-w-[1.5rem] rounded-full bg-orange-500 px-2 py-0.5 text-center text-xs font-semibold text-white"
                          }
                        >
                          {!sidebarCollapsed && badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Signed-in user */}
        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 rounded-lg p-2 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <span
              title={displayName}
              className="grid place-items-center h-9 w-9 shrink-0 rounded-full bg-teal-600 text-sm font-semibold text-white"
            >
              {initials}
            </span>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate" title={displayName}>
                  {displayName}
                </p>
                <p className="text-xs text-slate-400">{roleLabel}</p>
              </div>
            )}
            {!sidebarCollapsed && typeof logout === "function" && (
              <button
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
                className="grid place-items-center h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tourism Administration Panel</h1>
        <p className="text-gray-600 mb-8">Manage pending tourist locations, homestays and eco submissions.</p>

        {activeTab === "analytics" && <AnalyticsDashboard onNavigate={setActiveTab} />}

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
                            "site_photos",
                            "phone_number",
                            "user_type",
                            "is_crowded",
                            "site_activity_details_doc"
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
                            "longitude",
                            "email",
                            "homestay_location",
                            "room_type",
                            "price_range",
                            "check_in_out_time",
                            "activity_details_doc",
                            "suggestions_improvements"
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

        {activeTab === "hiddenPaths" && (
          <AdminHiddenPathsPanel
            canEdit={user?.role === "admin"}
            onPendingCountChange={setPendingPathsCount}
          />
        )}

        {activeTab === "addEditItineraries" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Add / Edit Itineraries</h2>
            <p className="text-gray-500 mb-8">This section will allow you to add or edit itineraries.</p>

            {/* --- Itinerary management --- */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Manage Itineraries</h2>
              <AdminItinerariesPanel />
            </div>

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

        {activeTab === "circuits" && <AdminCircuitsPanel />}

        {activeTab === "villageProfiles" && (
          <section>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-semibold">Village Profiles</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Create the rich, curated page shown for a village. Taluka and village name must exactly match what's used in the Locations table.
                </p>
              </div>
              {!villageFormOpen && (
                <button
                  onClick={() => setVillageFormOpen(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-semibold"
                >
                  + New Village Profile
                </button>
              )}
            </div>

            {villageActionError && (
              <p className="text-sm text-red-500 mb-4">{villageActionError}</p>
            )}

            {villageFormOpen && (
              <div className="bg-white p-5 rounded shadow mb-8">
                <AdminVillageProfileForm
                  onSaved={handleVillageProfileSaved}
                />
                <button
                  onClick={() => setVillageFormOpen(false)}
                  className="mt-4 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded"
                >
                  Close
                </button>
              </div>
            )}

            {villageProfilesLoading ? (
              <p className="text-gray-500">Loading village profiles...</p>
            ) : villageProfiles.length === 0 ? (
              <p className="text-gray-500">No village profiles yet. Create your first one above.</p>
            ) : (
              <div className="space-y-3">
                {villageProfiles.map((v) => (
                  <div key={v.id} className="bg-white p-4 rounded shadow flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold">{v.village_name}</h3>
                      <p className="text-sm text-gray-500">
                        {v.taluka_name} Taluka{v.tagline ? ` · ${v.tagline}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      Updated {new Date(v.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "exploreVillages" && (
          <AdminExploreVillagesPanel canEdit={user?.role === "admin"} />
        )}

        {activeTab === "manageData" && <AdminDataManager canEdit={user?.role === "admin"} />}

        {activeTab === "localExperiences" && <AdminExperiencesPanel />}

        {activeTab === "events" && <AdminEventsPanel />}
      </main>
    </div>
  );
}