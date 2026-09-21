import React, { useState } from "react";
import API_BASE_URL from "../../config";
import LocationPicker from "./LocationPicker";

const MIN_PHOTO_SIZE = 500 * 1024;
const MAX_GALLERY_PHOTOS = 6;

const STEP_LABELS = [
    "Basic Information",
    "Booking & Facilities",
    "Meals & Local Experience",
    "Photos & Feedback",
];

// Shared, compact styling — matches LocationForm so both registration forms feel consistent.
const inputCls =
    "w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";
const helpCls = "text-[11px] text-slate-400 mt-1";
const sectionHeadingCls = "text-base font-bold text-slate-800 border-b border-slate-200 pb-1.5";
const sectionSubCls = "text-xs text-slate-500 mt-1 mb-1";
const gridCls = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
const chipLabelCls = "inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer";
const chipGroupCls = "flex flex-wrap gap-x-5 gap-y-2";

// Fields required to move past each step. Checkbox-group fields (arrays) and
// the map's latitude/longitude are validated separately — see isEmptyValue / goNext.
const REQUIRED_BY_STEP = {
    1: [
        "homestay_name",
        "owner_name",
        "phone_number",
        "email",
        "situated_in",
        "village_name",
        "taluka_name",
        "district_name",
        "live_on_premises",
        "homestay_type",
        "homestay_unit_type",
        "homestay_location",
        "google_maps_discoverable",
        "mtdc_registered",
    ],
    2: [
        "booking_method",
        "listed_on_booking_platform",
        "room_type",
        "price_range",
        "facilities_services",
        "digital_payment",
        "check_in_out_time",
        "cancellation_policy",
    ],
    3: [
        "vegetarian_meals",
        "non_vegetarian_meals",
        "nearby_attractions",
        "guidance_available",
        "guides_available",
        "local_experiences",
        "activity_details_doc",
    ],
};

// True when a required value is empty — handles plain values as well as
// the checkbox-group fields, which are stored as arrays.
const isEmptyValue = (value) => (Array.isArray(value) ? value.length === 0 : !value);

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

// A field that should span both columns of the grid.
function Full({ children }) {
    return <div className="sm:col-span-2">{children}</div>;
}

// Single required-photo upload block — same "Choose Photo" + pop-in preview
// pattern as DriverForm's driver / vehicle / number-plate photo slots, used
// here for the one header/cover photo.
function PhotoSlot({ id, label, helperText, file, preview, onSelect, onRemove }) {
    return (
        <div>
            <label className={labelCls}>
                {label}
                <Required />
            </label>
            <p className={helpCls}>{helperText}</p>

            <div className="flex flex-wrap items-center gap-3 mt-2">
                <label
                    htmlFor={id}
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                >
                    <span aria-hidden="true">📷</span> {file ? "Change Photo" : "Choose Photo"}
                </label>
                <input
                    id={id}
                    type="file"
                    accept="image/*"
                    onChange={onSelect}
                    className="hidden"
                />

                <span
                    key={file ? "selected" : "empty"}
                    className={`lf-pop inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        file
                            ? "text-green-700 bg-green-50 border border-green-200"
                            : "text-slate-500 bg-slate-100 border border-slate-200"
                    }`}
                >
                    {file && <span aria-hidden="true">✓</span>}
                    {file ? "Photo selected" : "No photo selected"}
                </span>
            </div>

            {preview && (
                <div className="relative inline-block lf-pop mt-3">
                    <img
                        src={preview}
                        alt={label}
                        className="w-20 h-20 object-cover rounded border border-slate-300"
                    />
                    <span className="absolute -bottom-1 -left-1 bg-green-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center border border-white">
                        ✓
                    </span>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

export default function HomestayForm({ onSuccess }) {

    const [formData, setFormData] = useState({

        homestay_name: "",
        owner_name: "",
        phone_number: "",
        email: "",
        situated_in: "",
        village_name: "",
        taluka_name: "",
        district_name: "Ratnagiri",
        live_on_premises: "",
        homestay_type: "",
        homestay_unit_type: "",
        homestay_location: "",
        google_maps_discoverable: "",
        google_maps_link: "",
        mtdc_registered: "",
        booking_method: "",
        booking_app_name: "",
        listed_on_booking_platform: "",
        price_list: "",
        room_type: "",
        facilities_services: [],
        digital_payment: "",
        check_in_out_time: "",
        cancellation_policy: "",
        vegetarian_meals: "",
        non_vegetarian_meals: "",
        nearby_attractions: "",
        guidance_available: "",
        guides_available: "",
        local_experiences: "",
        social_media_link: "",
        price_range: "",
        activity_details_doc: "",
        suggestions_improvements: "",
        header_photo: "",
        site_photos: "",

        // Coordinates, picked on the map below (new)
        latitude: null,
        longitude: null,

    });

    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Single required cover/header photo — separate from the gallery below.
    const [headerPhoto, setHeaderPhoto] = useState(null);
    const [headerPhotoPreview, setHeaderPhotoPreview] = useState(null);

    // Gallery of additional homestay photos (up to MAX_GALLERY_PHOTOS).
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Inline validation feedback: a short banner + shake animation instead of
    // blocking browser alert() dialogs for missing required fields.
    const [formError, setFormError] = useState("");
    const [shake, setShake] = useState(false);

    const flashError = (message) => {
        setFormError(message);
        setShake(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setShake(false), 500);
    };

    const handleHeaderPhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size < MIN_PHOTO_SIZE) {
            alert(`This photo is smaller than 500 KB and was skipped: ${file.name}`);
            e.target.value = "";
            return;
        }

        if (formError) setFormError("");

        setHeaderPhoto(file);
        setHeaderPhotoPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const removeHeaderPhoto = () => {
        setHeaderPhoto(null);
        setHeaderPhotoPreview(null);
    };

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);

        if (selectedPhotos.length + files.length > MAX_GALLERY_PHOTOS) {
            alert(`You can upload a maximum of ${MAX_GALLERY_PHOTOS} photos.`);
            e.target.value = "";
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

        const validFiles = files.filter((file) => file.size >= MIN_PHOTO_SIZE);

        if (validFiles.length > 0 && formError) setFormError("");

        setSelectedPhotos((prev) => [...prev, ...validFiles]);
        setPhotoPreviews((prev) => [
            ...prev,
            ...validFiles.map((file) => URL.createObjectURL(file)),
        ]);

        e.target.value = "";
    };

    const removePhoto = (index) => {
        setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

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

    const uploadPhotos = async () => {
        const uploadedUrls = [];

        for (const file of selectedPhotos) {
            const url = await uploadSinglePhoto(file);
            uploadedUrls.push(url);
        }

        return uploadedUrls;
    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        if (formError) setFormError("");

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    const goNext = () => {
        if (step === 1 && (formData.latitude == null || formData.longitude == null)) {
            flashError("Please pin your homestay's location on the map before continuing.");
            return;
        }

        const missing = (REQUIRED_BY_STEP[step] || []).filter((key) => isEmptyValue(formData[key]));

        if (missing.length > 0) {
            flashError(
                `Please fill in all required fields marked * before continuing (${missing.length} remaining).`
            );
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

        if (formData.latitude == null || formData.longitude == null) {
            flashError("Please pin your homestay's location on the map before submitting.");
            return;
        }

        if (!headerPhoto) {
            flashError("Please add a header photo before submitting.");
            return;
        }

        if (selectedPhotos.length === 0) {
            flashError("Please add at least one homestay photo before submitting.");
            return;
        }

        if (!formData.suggestions_improvements.trim()) {
            flashError("Please share a note or query before submitting.");
            return;
        }

        try {

            setUploading(true);

            const [headerPhotoUrl, photoUrls] = await Promise.all([
                uploadSinglePhoto(headerPhoto),
                uploadPhotos(),
            ]);

            const payload = {
                ...formData,
                header_photo: headerPhotoUrl,
                site_photos: photoUrls.join(","),
            };

            const response = await fetch(
                `${API_BASE_URL}/api/homestays/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Submission failed");
            }

            alert(result.message);

            if (onSuccess) {
                onSuccess();
            }

            setFormData({

                homestay_name: "",
                owner_name: "",
                phone_number: "",
                email: "",
                situated_in: "",
                village_name: "",
                taluka_name: "",
                district_name: "Ratnagiri",

                live_on_premises: "",
                homestay_type: "",
                homestay_unit_type: "",
                homestay_location: "",
                google_maps_discoverable: "",
                google_maps_link: "",
                mtdc_registered: "",

                booking_method: "",
                booking_app_name: "",
                listed_on_booking_platform: "",
                price_list: "",
                room_type: "",

                facilities_services: [],
                digital_payment: "",
                check_in_out_time: "",
                cancellation_policy: "",
                vegetarian_meals: "",
                non_vegetarian_meals: "",

                nearby_attractions: "",
                guidance_available: "",
                guides_available: "",
                local_experiences: "",

                social_media_link: "",
                price_range: "",
                activity_details_doc: "",
                suggestions_improvements: "",
                header_photo: "",
                site_photos: "",

                latitude: null,
                longitude: null,

            });

            removeHeaderPhoto();
            setSelectedPhotos([]);
            setPhotoPreviews([]);
            setFormError("");
            setStep(1);

        } catch (err) {

            console.error(err);

            flashError(err.message);

        } finally {

            setUploading(false);

        }

    };

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-5 max-w-2xl mx-auto bg-white rounded-lg"
        >

            <style>{`
                @keyframes lf-shake {
                    10%, 90% { transform: translateX(-1px); }
                    20%, 80% { transform: translateX(2px); }
                    30%, 50%, 70% { transform: translateX(-4px); }
                    40%, 60% { transform: translateX(4px); }
                }
                .lf-shake { animation: lf-shake 0.5s; }
                @keyframes lf-pop {
                    0% { opacity: 0; transform: scale(0.6); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .lf-pop { animation: lf-pop 0.25s ease-out; }
            `}</style>

            <StepProgress step={step} totalSteps={totalSteps} labels={STEP_LABELS} />

            {formError && (
                <div
                    className={`rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ${
                        shake ? "lf-shake" : ""
                    }`}
                >
                    {formError}
                </div>
            )}

            {step === 1 ? (
                <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-slate-700">
                    <p className="font-semibold text-slate-800 mb-0.5">Why we ask for this</p>
                    <p>
                        The department uses these details to verify your homestay, list it accurately for
                        tourists, and reach you if there's a query. Fields marked <InternalTag /> are seen
                        only by the department and are never published publicly.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                        Takes about 8–10 minutes · Fields marked <Required /> are required to continue.
                    </p>
                </div>
            ) : (
                <p className="text-[11px] text-slate-500">
                    Reminder: listing details may be published once approved; fields marked
                    <InternalTag /> stay private with the department.
                </p>
            )}

            {step === 1 && (
            <>

            <div>
                <h3 className={sectionHeadingCls}>Section 1 : Basic Information</h3>
                <p className={sectionSubCls}>
                    Helps the department verify who runs this homestay and exactly where it is, so it can
                    be listed accurately and inspected if ever needed.
                </p>
            </div>

            <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

                <div>
                    <label className={labelCls}>Name of Homestay<Required /></label>
                    <input
                        type="text"
                        name="homestay_name"
                        value={formData.homestay_name}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Sea View Homestay"
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Name of Homestay Owner<Required /></label>
                    <input
                        type="text"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Ramesh Patil"
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Contact Number<Required /></label>
                    <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. 9876543210"
                        required
                    />
                    <p className={helpCls}>We'll use this number to contact you about your registration or booking queries.</p>
                </div>

                <div>
                    <label className={labelCls}>Email Address<Required /></label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. ramesh.patil@example.com"
                        required
                    />
                    <p className={helpCls}>We'll use this to send updates about your registration.</p>
                </div>

                <Full>
                    <label className={labelCls}>Homestay Situated In<Required /></label>
                    <div className={chipGroupCls}>
                        {["Village", "Town", "City"].map((option) => (
                            <label key={option} className={chipLabelCls}>
                                <input
                                    type="radio"
                                    name="situated_in"
                                    value={option}
                                    checked={formData.situated_in === option}
                                    onChange={handleChange}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </Full>

                <div>
                    <label className={labelCls}>Village / Town / City Name<Required /></label>
                    <input
                        type="text"
                        name="village_name"
                        value={formData.village_name}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Kelshi"
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Taluka Name<Required /></label>
                    <input
                        type="text"
                        name="taluka_name"
                        value={formData.taluka_name}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Dapoli"
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>District Name<Required /></label>
                    <input
                        type="text"
                        name="district_name"
                        value={formData.district_name}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    />
                </div>

                <Full>
                    <label className={labelCls}>Location on Map<Required /></label>
                    <LocationPicker
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onChange={(lat, lng) =>
                            setFormData((prev) => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng,
                            }))
                        }
                    />
                    <p className={helpCls}>Search, or drag the pin to your homestay's exact spot — this is what tourists will use to find you.</p>
                </Full>

                <div>
                    <label className={labelCls}>Do you live on the Homestay premises?<Required /></label>
                    <select
                        name="live_on_premises"
                        value={formData.live_on_premises}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>What type of Homestay do you have?<Required /></label>
                    <select
                        name="homestay_type"
                        value={formData.homestay_type}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Traditional(Local/Traditional architecture and lifestyle)</option>
                        <option>Farmhouse(Located on/near agricultural land)</option>
                        <option>Nature-Based(Surrounded by forest,hills,river)</option>
                        <option>Modern(Contemporary design and amenities)</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>What type of Homestay Unit do you have?<Required /></label>
                    <select
                        name="homestay_unit_type"
                        value={formData.homestay_unit_type}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Entire Home/Independent Unit</option>
                        <option>Kitchenette</option>
                        <option>Private room within host's house</option>
                        <option>Shared room</option>
                        <option>Cottage</option>
                        <option>Dormitory</option>
                        <option>Treehouse</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Homestay Location<Required /></label>
                    <select
                        name="homestay_location"
                        value={formData.homestay_location}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Beach</option>
                        <option>Farm</option>
                        <option>Inland</option>
                        <option>Hillside</option>
                        <option>Riverside</option>
                        <option>Village</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Can the Homestay be discovered on Google Maps?<Required /></label>
                    <select
                        name="google_maps_discoverable"
                        value={formData.google_maps_discoverable}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <Full>
                    <label className={labelCls}>Google Maps Link (optional)</label>
                    <input
                        type="url"
                        name="google_maps_link"
                        value={formData.google_maps_link}
                        onChange={handleChange}
                        placeholder="https://maps.google.com/..."
                        className={inputCls}
                    />
                    <p className={helpCls}>Optional — the pin you placed above already captures your exact location. Add this only if you have an existing Google Maps listing link to share.</p>
                </Full>

                <div>
                    <label className={labelCls}>Are you registered with MTDC?<Required /></label>
                    <select
                        name="mtdc_registered"
                        value={formData.mtdc_registered}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                    <p className={helpCls}>Helps the department prioritize verified homestays for promotion.</p>
                </div>

            </div>

            </>
            )}


            {step === 2 && (
            <>

            <div>
                <h2 className={sectionHeadingCls}>Section 2 : Booking & Facilities</h2>
                <p className={sectionSubCls}>
                    Tells tourists how to book and what to expect, and helps the department understand
                    your capacity and pricing.
                </p>
            </div>

            <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

                <div>
                    <label className={labelCls}>How can tourists book your homestay?<Required /></label>
                    <select
                        name="booking_method"
                        value={formData.booking_method}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Phone Call</option>
                        <option>WhatsApp</option>
                        <option>Online</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>If Booking by App (Specify App Name)</label>
                    <input
                        type="text"
                        name="booking_app_name"
                        value={formData.booking_app_name}
                        onChange={handleChange}
                        placeholder="e.g. Airbnb, or type 'None'"
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className={labelCls}>Is your homestay listed on Booking.com / Airbnb?<Required /></label>
                    <select
                        name="listed_on_booking_platform"
                        value={formData.listed_on_booking_platform}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Type of Rooms<Required /></label>
                    <select
                        name="room_type"
                        value={formData.room_type}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                    </select>
                </div>

                <Full>
                    <label className={labelCls}>Price Range (According to Type of Rooms)<Required /></label>
                    <input
                        type="text"
                        name="price_range"
                        value={formData.price_range}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Deluxe: ₹3500/night, AC: ₹2500/night, Non-AC: ₹1800/night"
                        required
                    />
                    <p className={helpCls}>Clear pricing helps tourists budget and prevents disputes at check-in.</p>
                </Full>

                <Full>
                    <label className={labelCls}>Which facilities and services are provided?<Required /></label>
                    <div className={chipGroupCls}>
                        {[
                            "Breakfast",
                            "Lunch",
                            "Dinner",
                            "WiFi",
                            "Power Backup",
                            "Parking",
                            "Hot Water",
                        ].map((facility) => (
                            <label key={facility} className={chipLabelCls}>
                                <input
                                    type="checkbox"
                                    value={facility}
                                    checked={formData.facilities_services?.includes(facility) || false}
                                    onChange={(e) => {
                                        const updated = e.target.checked
                                            ? [...(formData.facilities_services || []), facility]
                                            : (formData.facilities_services || []).filter((item) => item !== facility);

                                        setFormData({
                                            ...formData,
                                            facilities_services: updated,
                                        });
                                    }}
                                />
                                <span>{facility}</span>
                            </label>
                        ))}
                    </div>
                </Full>

                <div>
                    <label className={labelCls}>Do you accept digital payments (UPI)?<Required /></label>
                    <select
                        name="digital_payment"
                        value={formData.digital_payment}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Check-In and Check-Out Time<Required /></label>
                    <input
                        type="text"
                        name="check_in_out_time"
                        value={formData.check_in_out_time}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Check-In: 12:00 PM | Check-Out: 10:00 AM"
                        required
                    />
                </div>

                <Full>
                    <label className={labelCls}>Cancellation Policy<Required /></label>
                    <textarea
                        name="cancellation_policy"
                        value={formData.cancellation_policy}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe your cancellation policy..."
                        className={inputCls}
                        required
                    />
                    <p className={helpCls}>Sets clear expectations up front and protects both you and the tourist if plans change.</p>
                </Full>

            </div>

            </>
            )}


            {step === 3 && (
            <>

            <div>
                <h2 className={sectionHeadingCls}>Section 3 : Meals & Local Experience</h2>
                <p className={sectionSubCls}>
                    Helps tourists plan their visit and helps the department promote authentic, local
                    experiences around your homestay.
                </p>
            </div>

            <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

                <div>
                    <label className={labelCls}>Do you provide Vegetarian Meals?<Required /></label>
                    <select
                        name="vegetarian_meals"
                        value={formData.vegetarian_meals}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Do you provide Non-Vegetarian Meals?<Required /></label>
                    <select
                        name="non_vegetarian_meals"
                        value={formData.non_vegetarian_meals}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <Full>
                    <label className={labelCls}>Major tourist attractions / places nearby<Required /></label>
                    <textarea
                        name="nearby_attractions"
                        value={formData.nearby_attractions}
                        onChange={handleChange}
                        rows={3}
                        placeholder="e.g. Murud Beach, Keshavraj Temple, Suvarnadurg Fort"
                        className={inputCls}
                        required
                    />
                </Full>

                <div>
                    <label className={labelCls}>Do you provide guidance to reach these places?<Required /></label>
                    <select
                        name="guidance_available"
                        value={formData.guidance_available}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Do you have guides available to assist tourists?<Required /></label>
                    <select
                        name="guides_available"
                        value={formData.guides_available}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Local Experiences Offered to Tourists<Required /></label>
                    <select
                        name="local_experiences"
                        value={formData.local_experiences}
                        onChange={handleChange}
                        className={inputCls}
                        required
                    >
                        <option value="">Select</option>
                        <option value="Traditional Food">Traditional Food</option>
                        <option value="Cultural Event">Cultural Event</option>
                        <option value="Community Experience">Community Experience</option>
                        <option value="Nature Walk">Nature Walk</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <Full>
                    <label className={labelCls}>Activity Details (Description, Conducted By & Photos)<Required /></label>
                    <input
                        type="url"
                        name="activity_details_doc"
                        value={formData.activity_details_doc}
                        onChange={handleChange}
                        placeholder="https://docs.google.com/document/d/xxxxxxxxxxxxxxxxxxxxxxxx/edit"
                        className={inputCls}
                        required
                    />
                </Full>

            </div>

            </>
            )}


            {step === 4 && (
            <>

            <div>
                <h2 className={sectionHeadingCls}>Section 4 : Photos & Feedback</h2>
                <p className={sectionSubCls}>
                    Photos help tourists choose your homestay with confidence, and your note goes
                    directly to the tourism department.
                </p>
            </div>

            <div className={`space-y-6 ${shake ? "lf-shake" : ""}`}>

            <PhotoSlot
                id="header-photo-upload-input"
                label="Header Photo (min 500 KB)"
                helperText="Your homestay's main cover photo — shown first on your listing card and at the top of your profile."
                file={headerPhoto}
                preview={headerPhotoPreview}
                onSelect={handleHeaderPhotoSelect}
                onRemove={removeHeaderPhoto}
            />

            <div>
                <label className={labelCls}>Homestay Photos (up to {MAX_GALLERY_PHOTOS}, min 500 KB each)<Required /></label>
                <p className={helpCls}>Additional photos of rooms, surroundings, and amenities — shown in your listing's photo gallery below the header photo.</p>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <label
                        htmlFor="homestay-photo-upload-input"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                    >
                        <span aria-hidden="true">📷</span> Choose Photos
                    </label>
                    <input
                        id="homestay-photo-upload-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                    />

                    <span
                        key={selectedPhotos.length}
                        className={`lf-pop inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            selectedPhotos.length > 0
                                ? "text-green-700 bg-green-50 border border-green-200"
                                : "text-slate-500 bg-slate-100 border border-slate-200"
                        }`}
                    >
                        {selectedPhotos.length > 0 && <span aria-hidden="true">✓</span>}
                        {selectedPhotos.length > 0
                            ? `${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""} selected`
                            : `0/${MAX_GALLERY_PHOTOS} photos selected`}
                    </span>
                </div>

                {photoPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                        {photoPreviews.map((src, index) => (
                            <div key={index} className="relative lf-pop">
                                <img
                                    src={src}
                                    alt={`preview-${index}`}
                                    className="w-16 h-16 object-cover rounded border border-slate-300"
                                />
                                <span className="absolute -bottom-1 -left-1 bg-green-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center border border-white">
                                    ✓
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
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
                <label className={labelCls}>Homestay's own booking website (if any)<Required /></label>
                <input
                    type="text"
                    name="social_media_link"
                    value={formData.social_media_link}
                    onChange={handleChange}
                    placeholder="Paste link or type 'No'"
                    className={inputCls}
                    required
                />
            </div>

            <div>
                <label className={labelCls}>
                    Suggestions / Query<Required />
                    <InternalTag />
                </label>
                <textarea
                    name="suggestions_improvements"
                    value={formData.suggestions_improvements}
                    onChange={handleChange}
                    rows="3"
                    className={inputCls}
                    placeholder="Query regarding Registration or Approval"
                    required
                />
            </div>

            </div>

            </>
            )}


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
                        {uploading ? "Uploading..." : "Submit Homestay"}
                    </button>
                )}

            </div>

        </form>

    );

}