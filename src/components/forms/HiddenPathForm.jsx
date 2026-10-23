import React, { useEffect, useState } from "react";
import * as ReactLeaflet from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, Loader2 } from "lucide-react";
import API_BASE_URL from "../../config";
import RatnagiriLocationFields from "../RatnagiriLocationFields";
import DraftResumeModal from "./DraftResumeModal";
import { useFormDraft } from "../../hooks/useFormDraft";

const { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } = ReactLeaflet;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_PHOTO_SIZE = 500 * 1024;
const MAX_PHOTOS = 3;
const DRAFT_KEY = "ratnagiri_hidden_path_form_draft";

const STEP_LABELS = [
    "Your Details",
    "Draw the Path on Map",
    "Path Details & Safety",
    "Photos & Note",
];

const PATH_TYPES = ["Forest trail", "Secret beach", "Waterfall", "Viewpoint", "Village walk"];
const DIFFICULTIES = ["Easy", "Moderate", "Hard"];
const USER_TYPES = ["Local Resident", "Homestay Host", "Local Guide", "Tourist", "Student", "Other"];

const REQUIRED_BY_STEP = {
    1: ["user_type", "submitter_name"],
    3: ["title", "path_type", "difficulty", "taluka_name", "village_name", "best_season", "how_to_reach", "safety_notes"],
};

// Starting values, also used to reset the form after a successful submit.
const INITIAL_FORM = {
    // Your details (private)
    user_type: "",
    submitter_name: "",
    phone_number: "",
    email_address: "",

    // Route
    path_start: null,
    path_waypoints: [],
    path_end: null,
    sensitive: false,
    consent_public_land: false,

    // Path details
    title: "",
    path_type: "",
    difficulty: "",
    taluka_name: "",
    village_name: "",
    district_name: "Ratnagiri",
    best_season: "",
    avoid_season: "",
    open_in_monsoon: false,
    how_to_reach: "",
    safety_notes: "",

    // Note + spam trap
    submitter_note: "",
    website: "",
};

const isEmptyValue = (value) => (Array.isArray(value) ? value.length === 0 : !value);

// Same compact styling as the other registration forms.
const inputCls =
    "w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";
const helpCls = "text-[11px] text-slate-400 mt-1";
const sectionHeadingCls = "text-base font-bold text-slate-800 border-b border-slate-200 pb-1.5";
const sectionSubCls = "text-xs text-slate-500 mt-1 mb-1";
const gridCls = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
const chipLabelCls = "inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer";
const chipGroupCls = "flex flex-wrap gap-x-5 gap-y-2";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function haversineKm(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const routeKm = (points) =>
    points.slice(1).reduce((sum, p, i) => sum + haversineKm(points[i], p), 0);

// Rough estimate for display only (3 km/h); the server works out the final time.
function formatWalk(km) {
    const min = (km / 3) * 60;
    if (min < 60) return `~${Math.max(5, Math.round(min / 5) * 5)} min`;
    return `~${Math.round(min / 30) / 2} hr`;
}

const pinIcon = (text, bg) =>
    L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:#fff;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font:700 12px sans-serif;">${text}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });

const START_ICON = pinIcon("S", "#2d6a3e");
const END_ICON = pinIcon("E", "#1e293b");
const WAYPOINT_ICON = L.divIcon({
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #ea580c;box-shadow:0 1px 3px rgba(0,0,0,.4);"></div>',
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function StepProgress({ step, totalSteps, labels }) {
    return (
        <div className="mb-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Step {step} of {totalSteps}: {labels[step - 1]}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );
}

function Required() {
    return <span className="text-red-600 font-semibold animate-pulse"> *</span>;
}

function InternalTag() {
    return (
        <span className="ml-2 inline-block align-middle text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            Internal use only
        </span>
    );
}

function Full({ children }) {
    return <div className="sm:col-span-2">{children}</div>;
}

function MapClicks({ onClick }) {
    useMapEvents({ click: (e) => onClick(e.latlng) });
    return null;
}

function FlyTo({ target }) {
    const map = useMap();
    useEffect(() => {
        if (target) map.flyTo(target, 14, { duration: 1.2 });
    }, [target, map]);
    return null;
}

// Lets Leaflet recalculate its size once the step is visible (it sits inside a modal/page).
function SizeFix() {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(t);
    }, [map]);
    return null;
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export default function HiddenPathForm({ onSuccess }) {
    const [formData, setFormData] = useState(INITIAL_FORM);

    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Inline validation feedback: a short banner + shake animation.
    const [formError, setFormError] = useState("");
    const [shake, setShake] = useState(false);

    // Map drawing state
    const [mode, setMode] = useState("start"); // start | waypoint | end
    const [history, setHistory] = useState([]); // what was placed, for Undo
    const [flyTarget, setFlyTarget] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [searching, setSearching] = useState(false);

    // Photos can't be saved in a draft, so they live outside formData.
    const [photos, setPhotos] = useState([]); // [{ file, preview }]
    const [uploading, setUploading] = useState(false);

    const { pendingDraft, continueDraft, discardDraft, clearDraft } = useFormDraft(
        DRAFT_KEY,
        formData,
        setFormData
    );

    const flashError = (message) => {
        setFormError(message);
        setShake(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setShake(false), 500);
    };

    const setField = (name, value) => {
        if (formError) setFormError("");
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChange = (e) => setField(e.target.name, e.target.value);
    const handleCheck = (e) => setField(e.target.name, e.target.checked);

    // ---- Route drawing -------------------------------------------------------

    const { path_start: start, path_waypoints: waypoints, path_end: end } = formData;
    const points = [start, ...waypoints, end].filter(Boolean);
    const km = points.length > 1 ? routeKm(points) : 0;

    const placePoint = ({ lat, lng }) => {
        if (formError) setFormError("");
        const pt = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
        const kind = !start ? "start" : mode === "waypoint" ? "wp" : mode;

        if (kind === "start") {
            setField("path_start", pt);
            setMode("waypoint");
        } else if (kind === "end") {
            setField("path_end", pt);
            setMode("waypoint");
        } else {
            setFormData((prev) => ({ ...prev, path_waypoints: [...prev.path_waypoints, pt] }));
        }
        setHistory((h) => [...h, kind]);
    };

    const undo = () => {
        // After restoring a draft the history is empty, so fall back to end -> waypoint -> start.
        const kind =
            history[history.length - 1] ||
            (end ? "end" : waypoints.length ? "wp" : start ? "start" : null);
        if (!kind) return;
        setHistory((h) => h.slice(0, -1));
        if (kind === "end") setField("path_end", null);
        else if (kind === "start") { setField("path_start", null); setMode("start"); }
        else setFormData((prev) => ({ ...prev, path_waypoints: prev.path_waypoints.slice(0, -1) }));
    };

    const clearRoute = () => {
        setFormData((prev) => ({ ...prev, path_start: null, path_waypoints: [], path_end: null }));
        setHistory([]);
        setMode("start");
    };

    const movePoint = (kind, index, latlng) => {
        const pt = { lat: Number(latlng.lat.toFixed(6)), lng: Number(latlng.lng.toFixed(6)) };
        if (kind === "start") setField("path_start", pt);
        else if (kind === "end") setField("path_end", pt);
        else
            setFormData((prev) => ({
                ...prev,
                path_waypoints: prev.path_waypoints.map((w, i) => (i === index ? pt : w)),
            }));
    };

    const searchPlace = async () => {
        const q = searchText.trim();
        if (!q) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(`${q}, Ratnagiri, Maharashtra`)}`
            );
            const data = await res.json();
            if (data[0]) setFlyTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            else flashError("Could not find that place. Try a nearby village name.");
        } catch {
            flashError("Search failed. Check your connection and try again.");
        } finally {
            setSearching(false);
        }
    };

    // ---- Photos ----------------------------------------------------------------

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);
        e.target.value = "";

        if (photos.length + files.length > MAX_PHOTOS) {
            alert(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
            return;
        }

        const tooSmall = files.filter((file) => file.size < MIN_PHOTO_SIZE);
        if (tooSmall.length > 0) {
            alert(
                `These photos are smaller than 500 KB and were skipped: ${tooSmall
                    .map((f) => f.name)
                    .join(", ")}`
            );
        }

        const valid = files.filter((file) => file.size >= MIN_PHOTO_SIZE);
        if (valid.length > 0 && formError) setFormError("");

        setPhotos((prev) => [
            ...prev,
            ...valid.map((file) => ({ file, preview: URL.createObjectURL(file) })),
        ]);
    };

    const removePhoto = (index) => setPhotos((prev) => prev.filter((_, i) => i !== index));

    const uploadSinglePhoto = async (file) => {
        const uploadData = new FormData();
        uploadData.append("photo", file);

        const res = await fetch(`${API_BASE_URL}/api/upload-photo`, {
            method: "POST",
            body: uploadData,
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Photo upload failed");
        }
        return data.url;
    };

    // ---- Step navigation -------------------------------------------------------

    const validateStep = () => {
        if (step === 1) {
            const missing = REQUIRED_BY_STEP[1].filter((k) => isEmptyValue(formData[k]));
            if (missing.length > 0) {
                return "Please fill in all required fields marked * before continuing.";
            }
            const phone = formData.phone_number.trim();
            const email = formData.email_address.trim();
            if (!phone && !email) return "Please give a phone number or an email so the department can reach you.";
            if (phone && phone.replace(/\D/g, "").length < 10) return "Please enter a valid 10-digit phone number.";
            if (email && !/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
        }
        if (step === 2) {
            if (!start || !end) return "Place a start point and an end point on the map.";
            if (km < 0.05) return "The start and end points are too close together. Draw the route along the path.";
            if (!formData.consent_public_land) {
                return "Please confirm the path is on public land or you have the owner's permission.";
            }
        }
        if (step === 3) {
            const missing = REQUIRED_BY_STEP[3].filter((k) => isEmptyValue(formData[k]));
            if (missing.length > 0) {
                return `Please fill in all required fields marked * before continuing (${missing.length} remaining).`;
            }
        }
        return "";
    };

    const goNext = () => {
        const err = validateStep();
        if (err) {
            flashError(err);
            return;
        }
        setFormError("");
        setStep((s) => Math.min(s + 1, totalSteps));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goBack = () => {
        setFormError("");
        setStep((s) => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (photos.length === 0) {
            flashError("Please add at least one photo before submitting.");
            return;
        }

        try {
            setUploading(true);

            const photoUrls = [];
            for (const p of photos) {
                photoUrls.push(await uploadSinglePhoto(p.file));
            }

            // eslint-disable-next-line no-unused-vars
            const { path_start, path_waypoints, path_end, ...rest } = formData;
            const payload = {
                ...rest,
                route: points.map((p) => [p.lat, p.lng]),
                photos: photoUrls,
            };

            const response = await fetch(`${API_BASE_URL}/api/hidden-paths/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Submission failed");
            }

            alert(result.message);

            if (onSuccess) {
                onSuccess();
            }

            clearDraft();
            setFormData(INITIAL_FORM);
            setPhotos([]);
            setHistory([]);
            setMode("start");
            setFormError("");
            setStep(1);
        } catch (err) {
            flashError(err.message);
        } finally {
            setUploading(false);
        }
    };

    // ---- Render ----------------------------------------------------------------

    return (
        <>
            <DraftResumeModal
                draft={pendingDraft}
                formLabel="Hidden Path"
                nameField="title"
                note="Photos aren't saved in drafts. You'll need to re-select them."
                onContinue={continueDraft}
                onDiscard={discardDraft}
            />

            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto bg-white rounded-lg">
                <style>{`
                    @keyframes hp-shake {
                        10%, 90% { transform: translateX(-1px); }
                        20%, 80% { transform: translateX(2px); }
                        30%, 50%, 70% { transform: translateX(-4px); }
                        40%, 60% { transform: translateX(4px); }
                    }
                    .hp-shake { animation: hp-shake 0.5s; }
                `}</style>

                <StepProgress step={step} totalSteps={totalSteps} labels={STEP_LABELS} />

                {formError && (
                    <div
                        className={`rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ${
                            shake ? "hp-shake" : ""
                        }`}
                    >
                        {formError}
                    </div>
                )}

                {step === 1 ? (
                    <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-slate-700">
                        <p className="font-semibold text-slate-800 mb-0.5">Before you start</p>
                        <p>
                            Share a quiet trail, secret cove or village walk. The tourism department checks every
                            path before it is published on the Hidden Paths page. Fields marked
                            <InternalTag /> are seen only by the department and are never published.
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                            Takes about 5 minutes · Fields marked <Required /> are required to continue.
                        </p>
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-500">
                        Reminder: paths are published only after approval; fields marked
                        <InternalTag /> stay private with the department.
                    </p>
                )}

                {/* STEP 1 — YOUR DETAILS */}
                {step === 1 && (
                    <>
                        <div>
                            <h3 className={sectionHeadingCls}>Section 1 : Your Details</h3>
                            <p className={sectionSubCls}>So the department can contact you about this submission.</p>
                        </div>

                        <div className={`${gridCls} ${shake ? "hp-shake" : ""}`}>
                            <div>
                                <label className={labelCls}>What Best Describes You?<Required /></label>
                                <select
                                    name="user_type"
                                    value={formData.user_type}
                                    onChange={handleChange}
                                    className={inputCls}
                                >
                                    <option value="">Select</option>
                                    {USER_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>Your Name<Required /><InternalTag /></label>
                                <input
                                    type="text"
                                    name="submitter_name"
                                    value={formData.submitter_name}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g. Sunil Patil"
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Contact Number<InternalTag /></label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g. 9876543210"
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Email Address<InternalTag /></label>
                                <input
                                    type="email"
                                    name="email_address"
                                    value={formData.email_address}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g. you@example.com"
                                />
                            </div>

                            <Full>
                                <p className={helpCls}>Please give at least one of phone or email.</p>
                            </Full>
                        </div>

                        {/* Spam trap: hidden from people, bots tend to fill it in */}
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            className="absolute -left-[9999px] w-px h-px opacity-0"
                        />
                    </>
                )}

                {/* STEP 2 — DRAW ON MAP */}
                {step === 2 && (
                    <>
                        <div>
                            <h2 className={sectionHeadingCls}>Section 2 : Draw the Path on Map</h2>
                            <p className={sectionSubCls}>
                                Tap the map to place your start point, then tap along the route. Drag any point to
                                adjust it. Length is worked out for you.
                            </p>
                        </div>

                        <div className={`border border-slate-200 rounded-md overflow-hidden ${shake ? "hp-shake" : ""}`}>
                            <div className="flex flex-wrap items-center gap-2 p-2.5 border-b border-slate-200 bg-slate-50">
                                {[
                                    { id: "start", label: "Start point" },
                                    { id: "waypoint", label: "Add waypoint" },
                                    { id: "end", label: "End point" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMode(m.id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                                            mode === m.id
                                                ? "bg-orange-600 text-white border-orange-600"
                                                : "bg-white text-slate-700 border-slate-300 hover:border-orange-500"
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                                <span className="flex-1" />
                                <button type="button" onClick={undo} className="text-xs font-semibold text-slate-700 px-2 hover:underline">
                                    Undo
                                </button>
                                <button type="button" onClick={clearRoute} className="text-xs font-semibold text-red-600 px-2 hover:underline">
                                    Clear
                                </button>
                            </div>

                            <div className="relative isolate h-[360px] [&_.leaflet-container]:cursor-crosshair">
                                <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-white rounded-md shadow-md px-3 py-1.5 w-[min(260px,70%)]">
                                    {searching ? (
                                        <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />
                                    ) : (
                                        <Search size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                searchPlace();
                                            }
                                        }}
                                        placeholder="Search a village or landmark"
                                        className="w-full text-xs outline-none bg-transparent"
                                    />
                                </div>

                                <MapContainer center={[17.4, 73.3]} zoom={9} className="w-full h-full z-0">
                                    <SizeFix />
                                    <FlyTo target={flyTarget} />
                                    <MapClicks onClick={placePoint} />
                                    <TileLayer
                                        url={`https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_KEY}`}
                                        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        maxZoom={20}
                                    />
                                    {points.length > 1 && (
                                        <Polyline
                                            positions={points.map((p) => [p.lat, p.lng])}
                                            pathOptions={{ color: "#ea580c", weight: 5, opacity: 0.95 }}
                                        />
                                    )}
                                    {waypoints.map((w, i) => (
                                        <Marker
                                            key={`wp-${i}`}
                                            position={[w.lat, w.lng]}
                                            icon={WAYPOINT_ICON}
                                            draggable
                                            eventHandlers={{ dragend: (e) => movePoint("wp", i, e.target.getLatLng()) }}
                                        />
                                    ))}
                                    {start && (
                                        <Marker
                                            position={[start.lat, start.lng]}
                                            icon={START_ICON}
                                            draggable
                                            eventHandlers={{ dragend: (e) => movePoint("start", 0, e.target.getLatLng()) }}
                                        />
                                    )}
                                    {end && (
                                        <Marker
                                            position={[end.lat, end.lng]}
                                            icon={END_ICON}
                                            draggable
                                            eventHandlers={{ dragend: (e) => movePoint("end", 0, e.target.getLatLng()) }}
                                        />
                                    )}
                                </MapContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { k: "Length", v: km > 0 ? `${km.toFixed(1)} km` : "–" },
                                { k: "Points", v: points.length },
                                { k: "Walk time", v: km > 0 ? formatWalk(km) : "–" },
                            ].map((s) => (
                                <div key={s.k} className="bg-slate-100 rounded-md px-3 py-2">
                                    <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{s.k}</p>
                                    <p className="text-base font-bold text-slate-800">{s.v}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <label className={`${chipLabelCls} items-start`}>
                                <input
                                    type="checkbox"
                                    name="consent_public_land"
                                    checked={formData.consent_public_land}
                                    onChange={handleCheck}
                                    className="mt-1"
                                />
                                <span>
                                    This path is on public land, or I have the owner's permission to share it.<Required />
                                </span>
                            </label>
                            <label className={`${chipLabelCls} items-start`}>
                                <input
                                    type="checkbox"
                                    name="sensitive"
                                    checked={formData.sensitive}
                                    onChange={handleCheck}
                                    className="mt-1"
                                />
                                <span>
                                    This is a sensitive place (nesting beach, sacred grove). Ask the department to show
                                    only the nearest village.
                                </span>
                            </label>
                            <p className="text-xs text-amber-900 bg-amber-50 rounded-md px-3 py-2">
                                Do not submit paths through private farms, protected forest areas or places that are
                                unsafe to walk.
                            </p>
                        </div>
                    </>
                )}

                {/* STEP 3 — PATH DETAILS & SAFETY */}
                {step === 3 && (
                    <>
                        <div>
                            <h2 className={sectionHeadingCls}>Section 3 : Path Details & Safety</h2>
                            <p className={sectionSubCls}>
                                This is what visitors will read, so be clear and honest about the risks.
                            </p>
                        </div>

                        <div className={`${gridCls} ${shake ? "hp-shake" : ""}`}>
                            <Full>
                                <label className={labelCls}>Path Title<Required /></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g. Cliff Edge Trail to a Quiet Cove"
                                />
                            </Full>

                            <div>
                                <label className={labelCls}>Type of Path<Required /></label>
                                <select
                                    name="path_type"
                                    value={formData.path_type}
                                    onChange={handleChange}
                                    className={inputCls}
                                >
                                    <option value="">Select</option>
                                    {PATH_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>Difficulty<Required /></label>
                                <div className={`${chipGroupCls} pt-1.5`}>
                                    {DIFFICULTIES.map((d) => (
                                        <label key={d} className={chipLabelCls}>
                                            <input
                                                type="radio"
                                                name="difficulty"
                                                value={d}
                                                checked={formData.difficulty === d}
                                                onChange={handleChange}
                                            />
                                            {d}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <RatnagiriLocationFields
                                taluka={formData.taluka_name}
                                village={formData.village_name}
                                onChange={(patch) => {
                                    if (formError) setFormError("");
                                    setFormData((prev) => ({ ...prev, ...patch }));
                                }}
                            />

                            <div>
                                <label className={labelCls}>Best Season<Required /></label>
                                <input
                                    type="text"
                                    name="best_season"
                                    value={formData.best_season}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g. Nov to Mar"
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Avoid</label>
                                <input
                                    type="text"
                                    name="avoid_season"
                                    value={formData.avoid_season}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g. Monsoon, July to September"
                                />
                            </div>

                            <Full>
                                <label className={chipLabelCls}>
                                    <input
                                        type="checkbox"
                                        name="open_in_monsoon"
                                        checked={formData.open_in_monsoon}
                                        onChange={handleCheck}
                                    />
                                    This path is safe and open to walk in the monsoon
                                </label>
                            </Full>

                            <Full>
                                <label className={labelCls}>How to Reach<Required /></label>
                                <textarea
                                    name="how_to_reach"
                                    value={formData.how_to_reach}
                                    onChange={handleChange}
                                    rows="3"
                                    className={inputCls}
                                    placeholder="e.g. Park near the coast road bus stop, walk past the temple and follow the cliff footpath."
                                />
                            </Full>

                            <Full>
                                <label className={labelCls}>Safety Notes<Required /></label>
                                <textarea
                                    name="safety_notes"
                                    value={formData.safety_notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className={inputCls}
                                    placeholder="e.g. Steep drop near the cliff. No mobile network. Not safe at high tide."
                                />
                                <p className={helpCls}>
                                    Mention tides, slippery rocks, leeches, animals, network, water and anything else a
                                    visitor should know.
                                </p>
                            </Full>
                        </div>
                    </>
                )}

                {/* STEP 4 — PHOTOS & NOTE */}
                {step === 4 && (
                    <>
                        <div>
                            <h2 className={sectionHeadingCls}>Section 4 : Photos & Note</h2>
                            <p className={sectionSubCls}>
                                Photos help visitors recognise the place; your note goes directly to the tourism
                                department.
                            </p>
                        </div>

                        <div className={`space-y-6 ${shake ? "hp-shake" : ""}`}>
                            <div>
                                <label className={labelCls}>
                                    Path Photos (1 to {MAX_PHOTOS}, min 500 KB each)<Required />
                                </label>
                                <p className={helpCls}>The first photo is used as the cover photo.</p>

                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <label
                                        htmlFor="hidden-path-photo-input"
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                                    >
                                        <span aria-hidden="true">📷</span> Choose Photos
                                    </label>
                                    <input
                                        id="hidden-path-photo-input"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoSelect}
                                        className="hidden"
                                    />

                                    <span
                                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                            photos.length > 0
                                                ? "text-green-700 bg-green-50 border-green-200"
                                                : "text-slate-500 bg-slate-100 border-slate-200"
                                        }`}
                                    >
                                        {photos.length > 0
                                            ? `✓ ${photos.length} photo${photos.length > 1 ? "s" : ""} selected`
                                            : `0/${MAX_PHOTOS} photos selected`}
                                    </span>
                                </div>

                                {photos.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {photos.map((p, index) => (
                                            <div key={p.preview} className="relative">
                                                <img
                                                    src={p.preview}
                                                    alt={`preview-${index}`}
                                                    className="w-16 h-16 object-cover rounded border border-slate-300"
                                                />
                                                {index === 0 && (
                                                    <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-black/60 text-white rounded-b">
                                                        Cover
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    aria-label="Remove photo"
                                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelCls}>
                                    Note to the Department
                                    <InternalTag />
                                </label>
                                <textarea
                                    name="submitter_note"
                                    value={formData.submitter_note}
                                    onChange={handleChange}
                                    rows="3"
                                    className={inputCls}
                                    placeholder="Anything the reviewer should know (optional)"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* NAVIGATION */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={goBack}
                            className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <span />
                    )}

                    {step < totalSteps ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-md transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-md transition-colors disabled:opacity-60"
                        >
                            {uploading ? "Uploading..." : "Submit Path"}
                        </button>
                    )}
                </div>
            </form>
        </>
    );
}
