import React, { useState } from "react";
import API_BASE_URL from "../../config";
import LocationPicker from "./LocationPicker";

const STEP_LABELS = [
    "Basic Information",
    "Photos & Confirmation",
];

// Shared, compact styling — matches HomestayForm / LocationForm so all
// registration forms feel consistent.
const inputCls =
    "w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";
const helpCls = "text-[11px] text-slate-400 mt-1";
const sectionHeadingCls = "text-base font-bold text-slate-800 border-b border-slate-200 pb-1.5";
const sectionSubCls = "text-xs text-slate-500 mt-1 mb-1";
const gridCls = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
const chipLabelCls = "inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer";
const chipGroupCls = "flex flex-wrap gap-x-5 gap-y-2";

// Fields required to move past step 1. Latitude/longitude (from the map)
// are validated separately — see goNext.
const REQUIRED_BY_STEP = {
    1: [
        "driver_name",
        "phone_number",
        "email",
        "vehicle_type",
        "vehicle_number",
        "base_village",
        "taluka_name",
        "district_name",
        "service_area",
        "per_day_rate",
    ],
};

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

// Single required-photo upload block — reused for driver / vehicle / number
// plate photos. Mirrors the "Choose Photos" + pop-in preview pattern from
// HomestayForm, just scoped to one photo instead of a gallery of five.
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

export default function DriverForm({ onSuccess }) {

    const [formData, setFormData] = useState({
        driver_name: "",
        phone_number: "",
        email: "",
        vehicle_type: "",
        vehicle_number: "",
        base_village: "",
        taluka_name: "",
        district_name: "Ratnagiri",
        service_area: "",
        per_day_rate: "",

        // Coordinates, picked on the map below — replaces the old manual
        // "paste your Google Maps link" text field.
        latitude: null,
        longitude: null,
    });

    const [step, setStep] = useState(1);
    const totalSteps = 2;

    // Three separate, single-photo uploads instead of one generic
    // "vehicle_photos" gallery.
    const [driverPhoto, setDriverPhoto] = useState(null);
    const [driverPhotoPreview, setDriverPhotoPreview] = useState(null);

    const [vehiclePhoto, setVehiclePhoto] = useState(null);
    const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState(null);

    const [numberPlatePhoto, setNumberPlatePhoto] = useState(null);
    const [numberPlatePhotoPreview, setNumberPlatePhotoPreview] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (formError) setFormError("");

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSinglePhotoSelect = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (!file) return;

        if (formError) setFormError("");

        setFile(file);
        setPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const removeSinglePhoto = (setFile, setPreview) => {
        setFile(null);
        setPreview(null);
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

    const isEmptyValue = (value) => (Array.isArray(value) ? value.length === 0 : !value);

    const goNext = () => {
        if (formData.latitude == null || formData.longitude == null) {
            flashError("Please pin your base stand's location on the map before continuing.");
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

        if (!driverPhoto || !vehiclePhoto || !numberPlatePhoto) {
            flashError("Driver photo, vehicle photo, and number plate photo are all required.");
            return;
        }

        try {
            setUploading(true);

            const [driverPhotoUrl, vehiclePhotoUrl, numberPlatePhotoUrl] =
                await Promise.all([
                    uploadSinglePhoto(driverPhoto),
                    uploadSinglePhoto(vehiclePhoto),
                    uploadSinglePhoto(numberPlatePhoto),
                ]);

            const payload = {
                ...formData,
                driver_photo: driverPhotoUrl,
                vehicle_photo: vehiclePhotoUrl,
                number_plate_photo: numberPlatePhotoUrl,
            };

            const response = await fetch(
                `${API_BASE_URL}/api/drivers/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
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
                driver_name: "",
                phone_number: "",
                email: "",
                vehicle_type: "",
                vehicle_number: "",
                base_village: "",
                taluka_name: "",
                district_name: "Ratnagiri",
                service_area: "",
                per_day_rate: "",
                latitude: null,
                longitude: null,
            });

            removeSinglePhoto(setDriverPhoto, setDriverPhotoPreview);
            removeSinglePhoto(setVehiclePhoto, setVehiclePhotoPreview);
            removeSinglePhoto(setNumberPlatePhoto, setNumberPlatePhotoPreview);
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
                        The department uses these details to verify you as a driver, list your service
                        accurately for tourists, and reach you if there's a query. Fields marked{" "}
                        <InternalTag /> are seen only by the department and are never published publicly.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                        Takes about 5 minutes · Fields marked <Required /> are required to continue.
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
                    Helps the department verify who you are, what you drive, and exactly where your
                    stand is, so tourists can find and book you accurately.
                </p>
            </div>

            <div className={`${gridCls} ${shake ? "lf-shake" : ""}`}>

                <div>
                    <label className={labelCls}>Driver Name<Required /></label>
                    <input
                        type="text"
                        name="driver_name"
                        value={formData.driver_name}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Suresh Kadam"
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
                        placeholder="e.g. suresh.kadam@example.com"
                        required
                    />
                    <p className={helpCls}>We'll use this to send updates about your registration.</p>
                </div>

                <Full>
                    <label className={labelCls}>Vehicle Type<Required /></label>
                    <div className={chipGroupCls}>
                        {["Autorickshaw", "Taxi"].map((option) => (
                            <label key={option} className={chipLabelCls}>
                                <input
                                    type="radio"
                                    name="vehicle_type"
                                    value={option}
                                    checked={formData.vehicle_type === option}
                                    onChange={handleChange}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </Full>

                <div>
                    <label className={labelCls}>Vehicle Number<Required /></label>
                    <input
                        type="text"
                        name="vehicle_number"
                        value={formData.vehicle_number}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. MH08 AB 1234"
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Base Village / Stand<Required /></label>
                    <input
                        type="text"
                        name="base_village"
                        value={formData.base_village}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. Ganpatipule Stand"
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
                        placeholder="e.g. Ratnagiri"
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
                    <p className={helpCls}>Search, or drag the pin to your exact stand — this is what tourists will use to find you. Replaces pasting a Google Maps link.</p>
                </Full>

                <Full>
                    <label className={labelCls}>Service Area (villages/places you cover)<Required /></label>
                    <textarea
                        name="service_area"
                        value={formData.service_area}
                        onChange={handleChange}
                        rows={3}
                        className={inputCls}
                        placeholder="e.g. Ganpatipule, Ratnadurg Fort, Bhatye Beach"
                        required
                    />
                </Full>

                <div>
                    <label className={labelCls}>Per-Day Rate<Required /></label>
                    <input
                        type="text"
                        name="per_day_rate"
                        value={formData.per_day_rate}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="e.g. ₹1500/day"
                        required
                    />
                </div>

            </div>

            </>
            )}


            {step === 2 && (
            <>

            <div>
                <h2 className={sectionHeadingCls}>Section 2 : Photos & Confirmation</h2>
                <p className={sectionSubCls}>
                    These three photos are what tourists and the department use to identify you, your
                    vehicle, and verify its registration — all three are required.
                </p>
            </div>

            <div className={`space-y-6 ${shake ? "lf-shake" : ""}`}>

                <PhotoSlot
                    id="driver-photo-upload-input"
                    label="Driver Photo"
                    helperText="Goes on your driver profile — used to verify your identity."
                    file={driverPhoto}
                    preview={driverPhotoPreview}
                    onSelect={(e) => handleSinglePhotoSelect(e, setDriverPhoto, setDriverPhotoPreview)}
                    onRemove={() => removeSinglePhoto(setDriverPhoto, setDriverPhotoPreview)}
                />

                <PhotoSlot
                    id="vehicle-photo-upload-input"
                    label="Vehicle Photo"
                    helperText="Shown to customers so they can recognize your vehicle."
                    file={vehiclePhoto}
                    preview={vehiclePhotoPreview}
                    onSelect={(e) => handleSinglePhotoSelect(e, setVehiclePhoto, setVehiclePhotoPreview)}
                    onRemove={() => removeSinglePhoto(setVehiclePhoto, setVehiclePhotoPreview)}
                />

                <PhotoSlot
                    id="number-plate-photo-upload-input"
                    label="Number Plate Photo"
                    helperText="Used to verify your vehicle's registration number."
                    file={numberPlatePhoto}
                    preview={numberPlatePhotoPreview}
                    onSelect={(e) => handleSinglePhotoSelect(e, setNumberPlatePhoto, setNumberPlatePhotoPreview)}
                    onRemove={() => removeSinglePhoto(setNumberPlatePhoto, setNumberPlatePhotoPreview)}
                />

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
                        {uploading ? "Uploading..." : "Submit Driver Registration"}
                    </button>
                )}

            </div>

        </form>

    );

}