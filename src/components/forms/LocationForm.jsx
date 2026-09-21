import React, { useState, useEffect } from 'react';
import API_BASE_URL from "../../config";
import LocationPicker from "./LocationPicker";
const MIN_PHOTO_SIZE = 500 * 1024;
const MAX_GALLERY_PHOTOS = 6;
const DRAFT_KEY = "ratnagiri_location_form_draft";

const STEP_LABELS = [
    "Basic Information",
    "Amenities & Accessibility",
    "Tourism Info & Sustainability",
    "Photos & Feedback",
];

const REQUIRED_BY_STEP = {
    1: [
        "user_type",
        "location_name",
        "phone_number",
        "email_address",
        "located_in",
        "village_name",
        "taluka_name",
        "district_name",
        "nearest_landmark",
        "owned_by",
        "managed_by",
    ],
    2: [
        "amenities_available",
        "road_condition",
        "signboards_available",
        "public_transport",
        "nearest_bus_stand",
        "nearest_railway_station",
        "parking_space",
        "food_stalls",
    ],
    3: [
        "attraction_type",
        "entry_fee",
        "entry_fee_amount",
        "visiting_hours",
        "seasonal_availability",
        "peak_period",
        "avg_time_spent",
        "visitor_type",
        "is_crowded",
        "crowd_level",
        "formal_regulations",
        "site_activities",
        "site_activity_details_doc",
        "local_residents_involved",
        "job_type",
    ],
};

// True when a required value is empty — handles plain values as well as
// the checkbox-group fields, which are stored as arrays.
const isEmptyValue = (value) => (Array.isArray(value) ? value.length === 0 : !value);

// Shared, compact styling so every field looks consistent.
const inputCls =
    "w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";
const helpCls = "text-[11px] text-slate-400 mt-1";
const sectionHeadingCls = "text-base font-bold text-slate-800 border-b border-slate-200 pb-1.5";
const sectionSubCls = "text-xs text-slate-500 mt-1 mb-1";
const gridCls = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
const chipLabelCls = "inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer";
const chipGroupCls = "flex flex-wrap gap-x-5 gap-y-2";

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
// pattern used for the header/cover photo in DriverForm and HomestayForm.
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

export default function LocationForm({ onSuccess }) {
    const [formData, setFormData] = useState({

    // Basic Information
    user_type: "",
    location_name: "",
    phone_number: "",
    email_address: "",
    located_in: "",
    village_name: "",
    taluka_name: "",
    district_name: "Ratnagiri",

    // Accessibility
    nearest_landmark: "",
    attraction_type: "",
    road_condition: "",
    signboards_available: "",
    public_transport: "",
    nearest_bus_stand: "",
    nearest_railway_station: "",


    // Tourism Facilities
    parking_space: "",
    food_stalls: "",
    amenities_available: [],

    // Management
    owned_by: "",
    managed_by: "",

    // Visitor Information
    entry_fee: "",
    entry_fee_amount: "",
    visiting_hours: "",
    seasonal_availability: "",
    peak_period: "",
    avg_time_spent: "",
    visitor_type: [],
    is_crowded: "",
    crowd_level: "",
    site_activities: "",
    site_activity_details_doc: "",

    // Sustainability
    formal_regulations: "",
    local_residents_involved: "",
    job_type: "",
    suggestions_improvements: "",

    // Contact
    user_description: "",
    google_maps_link: "",

    // Coordinates
    latitude: null,
    longitude: null,

    // Photos
    header_photo: "",
    site_photos: ""

});

const [step, setStep] = useState(1);
const totalSteps = 4;

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

// Single required cover/header photo — separate from the gallery below.
const [headerPhoto, setHeaderPhoto] = useState(null);
const [headerPhotoPreview, setHeaderPhotoPreview] = useState(null);

// Gallery of additional location photos (up to MAX_GALLERY_PHOTOS).
const [selectedPhotos, setSelectedPhotos] = useState([]);
const [photoPreviews, setPhotoPreviews] = useState([]);
const [uploading, setUploading] = useState(false);

// Offer to restore a saved draft on first load. Only text fields are
// restorable — selected photo files can't be persisted to localStorage.
useEffect(() => {
    try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved);
        const hasContent = Object.values(parsed).some((value) =>
            Array.isArray(value) ? value.length > 0 : !!value
        );

        if (!hasContent) {
            localStorage.removeItem(DRAFT_KEY);
            return;
        }

        if (window.confirm("We found a saved draft of this form. Continue where you left off?")) {
            setFormData((prev) => ({ ...prev, ...parsed }));
        } else {
            localStorage.removeItem(DRAFT_KEY);
        }
    } catch (err) {
        // Corrupt or inaccessible draft — ignore and start fresh.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Autosave the draft as the user types (text fields only).
useEffect(() => {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch (err) {
        // Storage full or unavailable — not critical, ignore.
    }
}, [formData]);

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
        flashError("Please select the location on the map before continuing.");
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
      flashError("Please select the location on the map before submitting.");
      return;
  }

  if (!headerPhoto) {
      flashError("Please add a header photo before submitting.");
      return;
  }

  if (selectedPhotos.length === 0) {
      flashError("Please add at least one location photo before submitting.");
      return;
  }

  if (!formData.suggestions_improvements.trim()) {
      flashError("Please share a suggestion or note before submitting.");
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
    `${API_BASE_URL}/api/locations/register`,
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

    localStorage.removeItem(DRAFT_KEY);

    setFormData({

  // Basic Information
  user_type: "",
  location_name: "",
  phone_number: "",
  email_address: "",
  located_in: "",
  village_name: "",
  taluka_name: "",
  district_name: "Ratnagiri",

  // Accessibility
  nearest_landmark: "",
  attraction_type: "",
  road_condition: "",
  signboards_available: "",
  public_transport: "",
  nearest_bus_stand: "",
  nearest_railway_station: "",

  // Tourism Facilities
  parking_space: "",
  food_stalls: "",
  amenities_available: [],
  // Management
  owned_by: "",
  managed_by: "",

  // Visitor Information
  entry_fee: "",
  entry_fee_amount: "",
  visiting_hours: "",
  seasonal_availability: "",
  peak_period: "",
  avg_time_spent: "",
  visitor_type: [],
  is_crowded: "",
  crowd_level: "",
  site_activities: "",
  site_activity_details_doc: "",
  header_photo: "",
  site_photos: "",

  // Sustainability
  formal_regulations: "",
  local_residents_involved: "",
  job_type: "",
  suggestions_improvements: "",

  // Contact
  user_description: "",
  google_maps_link: "",

  latitude: null,
  longitude: null,

});

    removeHeaderPhoto();
    setSelectedPhotos([]);
    setPhotoPreviews([]);
    setFormError("");
    setStep(1);

  } catch (err) {
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
                <p className="font-semibold text-slate-800 mb-0.5">Before you start</p>
                <p>
                    Location and amenity details you submit here may be published on the public Ratnagiri
                    Tourism site once reviewed and approved by the department. Fields marked
                    <InternalTag /> are seen only by the tourism department and are never published.
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5">
                    Takes about 6–8 minutes · Fields marked <Required /> are required to continue.
                </p>
            </div>

        ) : (

            <p className="text-[11px] text-slate-500">
                Reminder: public location details may be published once approved; fields marked
                <InternalTag /> stay private with the department.
            </p>

        )}

        {step === 1 && (
        <>

        <div>
            <h3 className={sectionHeadingCls}>Section 1 : Basic Information</h3>
            <p className={sectionSubCls}>Helps us map and catalog this location accurately.</p>
        </div>

        <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

            <div>
                <label className={labelCls}>What Best Describes You?<Required /></label>
                <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Tourist">Tourist</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Local Resident">Local Resident</option>
                    <option value="Student">Student</option>
                    <option value="Tour Operator">Tour Operator</option>
                    <option value="Local Guide">Local Guide</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Name of Location<Required /></label>
                <input
                    type="text"
                    name="location_name"
                    value={formData.location_name}
                    onChange={handleChange}
                    className={inputCls}
                    required
                    placeholder="e.g. Unhavare Hot Water Springs"
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
                <p className={helpCls}>We'll use this number to contact you about this submission.</p>
            </div>

            <div>
                <label className={labelCls}>Email Address<Required /></label>
                <input
                    type="email"
                    name="email_address"
                    value={formData.email_address}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. you@example.com"
                    required
                />
                <p className={helpCls}>We'll use this to send updates about this submission.</p>
            </div>

            <Full>
                <label className={labelCls}>Located In<Required /></label>
                <div className={chipGroupCls}>
                    {["Village", "Town", "City"].map((item) => (
                        <label key={item} className={chipLabelCls}>
                            <input
                                type="radio"
                                name="located_in"
                                value={item}
                                checked={formData.located_in === item}
                                onChange={handleChange}
                            />
                            {item}
                        </label>
                    ))}
                </div>
            </Full>

            <div>
                <label className={labelCls}>Village Name<Required /></label>
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
                <label className={labelCls}>Taluka<Required /></label>
                <input
                    type="text"
                    name="taluka_name"
                    value={formData.taluka_name}
                    onChange={handleChange}
                    className={inputCls}
                    required
                    placeholder="e.g. Dapoli"
                />
            </div>

            <div>
                <label className={labelCls}>District<Required /></label>
                <input
                    type="text"
                    name="district_name"
                    value={formData.district_name}
                    onChange={handleChange}
                    className={inputCls}
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Nearest Landmark<Required /></label>
                <input
                    type="text"
                    name="nearest_landmark"
                    value={formData.nearest_landmark}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Near Murud Beach"
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
            </Full>

            <Full>
                <h3 className="text-sm font-bold text-slate-800 mb-2 mt-1">Managed and Owned By</h3>
                <div className={gridCls}>
                    <div>
                        <label className={labelCls}>Owned By<Required /></label>
                        <div className={chipGroupCls}>
                            {["Government", "Private", "Community", "Public", "Open"].map((item) => (
                                <label key={item} className={chipLabelCls}>
                                    <input
                                        type="radio"
                                        name="owned_by"
                                        value={item}
                                        checked={formData.owned_by === item}
                                        onChange={handleChange}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Managed By<Required /></label>
                        <div className={chipGroupCls}>
                            {[
                                "Gram Panchayat",
                                "MTDC",
                                "Private",
                                "Community Based",
                                "Public",
                                "Government",
                                "Open",
                            ].map((item) => (
                                <label key={item} className={chipLabelCls}>
                                    <input
                                        type="radio"
                                        name="managed_by"
                                        value={item}
                                        checked={formData.managed_by === item}
                                        onChange={handleChange}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Full>

        </div>

        </>
        )}


        {step === 2 && (
        <>

        <div>
            <h2 className={sectionHeadingCls}>Section 2 : Amenities & Accessibility</h2>
            <p className={sectionSubCls}>Used to advise visitors and prioritize where the district should invest in facilities.</p>
        </div>

        <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

            <Full>
                <label className={labelCls}>Amenities Available<Required /></label>
                <div className={chipGroupCls}>
                    {[
                        "Washrooms",
                        "Drinking Water",
                        "Informative Boards",
                        "First Aid Kit",
                        "Sitting Area"
                    ].map((item) => (
                        <label key={item} className={chipLabelCls}>
                            <input
                                type="checkbox"
                                value={item}
                                checked={(formData.amenities_available || []).includes(item)}
                                onChange={(e) => {
                                    const current = formData.amenities_available || [];
                                    if (e.target.checked) {
                                        setFormData({
                                            ...formData,
                                            amenities_available: [...current, item],
                                        });
                                    } else {
                                        setFormData({
                                            ...formData,
                                            amenities_available: current.filter((value) => value !== item),
                                        });
                                    }
                                }}
                            />
                            <span>{item}</span>
                        </label>
                    ))}
                </div>
            </Full>

            <div>
                <label className={labelCls}>Road Condition<Required /></label>
                <select
                    name="road_condition"
                    value={formData.road_condition}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select Road Condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Signboards Available<Required /></label>
                <select
                    name="signboards_available"
                    value={formData.signboards_available}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Public Transport Available<Required /></label>
                <select
                    name="public_transport"
                    value={formData.public_transport}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Bus">Available and Frequent</option>
                    <option value="Train">Available but Infrequent</option>
                    <option value="Both">Not Available</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Parking Space Available<Required /></label>
                <select
                    name="parking_space"
                    value={formData.parking_space}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Nearest Bus Stand<Required /></label>
                <input
                    type="text"
                    name="nearest_bus_stand"
                    value={formData.nearest_bus_stand}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Dapoli Bus Stand"
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Nearest Railway Station<Required /></label>
                <input
                    type="text"
                    name="nearest_railway_station"
                    value={formData.nearest_railway_station}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Khed Railway Station"
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Food Stalls Available<Required /></label>
                <select
                    name="food_stalls"
                    value={formData.food_stalls}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

        </div>

        </>
        )}


        {step === 3 && (
        <>

        <div>
            <h2 className={sectionHeadingCls}>Section 3 : Tourism Information & Sustainability</h2>
            <p className={sectionSubCls}>
                Helps us understand visitor patterns and manage crowding sustainably, and see where
                local communities are (or aren't) benefiting economically.
            </p>
        </div>

        <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

            <div>
                <label className={labelCls}>Type of Attraction<Required /></label>
                <select
                    name="attraction_type"
                    value={formData.attraction_type}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select Attraction Type</option>
                    <option value="Nature">Nature</option>
                    <option value="Beach">Beach</option>
                    <option value="Fort">Fort</option>
                    <option value="Temple">Temple</option>
                    <option value="Waterfall">Waterfall</option>
                    <option value="Historical">Historical</option>
                    <option value="Religious">Religious</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Entry Fee<Required /></label>
                <select
                    name="entry_fee"
                    value={formData.entry_fee}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Entry Fee Amount<Required /></label>
                <input
                    type="text"
                    name="entry_fee_amount"
                    value={formData.entry_fee_amount}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. 20 Rs."
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Visiting Hours<Required /></label>
                <input
                    type="text"
                    name="visiting_hours"
                    value={formData.visiting_hours}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. 8 AM - 6 PM"
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Seasonal Availability<Required /></label>
                <div className={chipGroupCls + " pt-1"}>
                    {["Open All Year", "Seasonal"].map((option) => (
                        <label key={option} className={chipLabelCls}>
                            <input
                                type="radio"
                                name="seasonal_availability"
                                value={option}
                                checked={formData.seasonal_availability === option}
                                onChange={handleChange}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className={labelCls}>Peak Period<Required /></label>
                <input
                    type="text"
                    name="peak_period"
                    value={formData.peak_period}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. October - February"
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Average Engagement Time<Required /></label>
                <input
                    type="text"
                    name="avg_time_spent"
                    value={formData.avg_time_spent}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. 2 Hours"
                    required
                />
            </div>

            <div>
                <label className={labelCls}>Is it crowded or not?<Required /></label>
                <select
                    name="is_crowded"
                    value={formData.is_crowded}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Crowd Level<Required /></label>
                <select
                    name="crowd_level"
                    value={formData.crowd_level}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Low">Low (0-25 Tourists)</option>
                    <option value="Medium">Medium (26-75 Tourists)</option>
                    <option value="High">High (More than 75 Tourists)</option>
                </select>
            </div>

            <Full>
                <label className={labelCls}>Visitor Type<Required /></label>
                <div className={chipGroupCls}>
                    {[
                        "Weekend Visitors",
                        "Day Visitors",
                        "Groups",
                        "Families",
                        "Researchers",
                        "Students",
                        "Trekkers",
                    ].map((option) => (
                        <label key={option} className={chipLabelCls}>
                            <input
                                type="checkbox"
                                checked={formData.visitor_type?.includes(option)}
                                onChange={(e) => {
                                    const current = formData.visitor_type || [];
                                    if (e.target.checked) {
                                        setFormData({
                                            ...formData,
                                            visitor_type: [...current, option],
                                        });
                                    } else {
                                        setFormData({
                                            ...formData,
                                            visitor_type: current.filter((item) => item !== option),
                                        });
                                    }
                                }}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </Full>

            <Full>
                <label className={labelCls}>
                    Formal Regulations for visitors? (e.g. visiting hours, no plastic, dress code)<Required />
                </label>
                <div className={chipGroupCls}>
                    {["Yes", "No"].map((option) => (
                        <label key={option} className={chipLabelCls}>
                            <input
                                type="radio"
                                name="formal_regulations"
                                value={option}
                                checked={formData.formal_regulations === option}
                                onChange={handleChange}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </Full>

            <Full>
                <label className={labelCls}>Site Activities<Required /></label>
                <div className={chipGroupCls}>
                    {[
                        "Traditional Food",
                        "Cultural Event",
                        "Community Experience",
                        "Nature Walk",
                        "Other",
                    ].map((option) => (
                        <label key={option} className={chipLabelCls}>
                            <input
                                type="radio"
                                name="site_activities"
                                value={option}
                                checked={formData.site_activities === option}
                                onChange={handleChange}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </Full>

            <Full>
                <label className={labelCls}>
                    Activity Details (Description, Conducted By & Photos)<Required />
                </label>
                <input
                    type="url"
                    name="site_activity_details_doc"
                    value={formData.site_activity_details_doc}
                    onChange={handleChange}
                    placeholder="Paste Google Docs link"
                    className={inputCls}
                    required
                />
            </Full>

            <div>
                <label className={labelCls}>
                    Are local residents involved in employment or income-generating activities here?<Required />
                </label>
                <select
                    name="local_residents_involved"
                    value={formData.local_residents_involved}
                    onChange={handleChange}
                    className={inputCls}
                    required
                >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>
                    If yes (Job type)<Required />
                    <InternalTag />
                </label>
                <input
                    type="text"
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Guide, Boat Service, Food Stall"
                    required
                />
            </div>

        </div>

        </>
        )}


        {step === 4 && (
        <>

        <div>
            <h2 className={sectionHeadingCls}>Section 4 : Photos & Feedback</h2>
            <p className={sectionSubCls}>Photos help visitors discover this place; your note goes directly to the tourism department.</p>
        </div>

        <div className={`space-y-6 ${shake ? "lf-shake" : ""}`}>

        <PhotoSlot
            id="header-photo-upload-input"
            label="Header Photo (min 500 KB)"
            helperText="This location's main cover photo — shown first on its listing card and at the top of its profile."
            file={headerPhoto}
            preview={headerPhotoPreview}
            onSelect={handleHeaderPhotoSelect}
            onRemove={removeHeaderPhoto}
        />

        <div>
            <label className={labelCls}>Location Photos (up to {MAX_GALLERY_PHOTOS}, min 500 KB each)<Required /></label>
            <p className={helpCls}>Additional photos of the site and surroundings — shown in the listing's photo gallery below the header photo.</p>

            <div className="flex flex-wrap items-center gap-3 mt-2">
                <label
                    htmlFor="photo-upload-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                >
                    <span aria-hidden="true">📷</span> Choose Photos
                </label>
                <input
                    id="photo-upload-input"
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
            <label className={labelCls}>
                Suggestions / Improvements<Required />
                <InternalTag />
            </label>
            <textarea
                name="suggestions_improvements"
                value={formData.suggestions_improvements}
                onChange={handleChange}
                rows="3"
                className={inputCls}
                placeholder="Suggestions for improving the tourist destination"
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
                    {uploading ? "Uploading..." : "Submit Profile Data"}
                </button>
            )}

        </div>

    </form>
  );
}