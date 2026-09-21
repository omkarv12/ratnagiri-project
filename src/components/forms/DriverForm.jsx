import React, { useState } from "react";
import API_BASE_URL from "../../config";

export default function DriverForm({ onSuccess }) {

    const [formData, setFormData] = useState({
        driver_name: "",
        phone_number: "",
        vehicle_type: "",
        vehicle_number: "",
        base_village: "",
        taluka_name: "",
        district_name: "Ratnagiri",
        service_area: "",
        per_day_rate: "",
        google_maps_link: "",
    });

    // Three separate, single-photo uploads instead of one generic "vehicle_photos" bucket
    const [driverPhoto, setDriverPhoto] = useState(null);
    const [driverPhotoPreview, setDriverPhotoPreview] = useState(null);

    const [vehiclePhoto, setVehiclePhoto] = useState(null);
    const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState(null);

    const [numberPlatePhoto, setNumberPlatePhoto] = useState(null);
    const [numberPlatePhotoPreview, setNumberPlatePhotoPreview] = useState(null);

    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Generic single-photo select handler, reused for all three photo slots
    const handleSinglePhotoSelect = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (!file) return;

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!driverPhoto || !vehiclePhoto || !numberPlatePhoto) {
            alert("Driver photo, vehicle photo, and number plate photo are all required.");
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
                vehicle_type: "",
                vehicle_number: "",
                base_village: "",
                taluka_name: "",
                district_name: "Ratnagiri",
                service_area: "",
                per_day_rate: "",
                google_maps_link: "",
            });

            removeSinglePhoto(setDriverPhoto, setDriverPhotoPreview);
            removeSinglePhoto(setVehiclePhoto, setVehiclePhotoPreview);
            removeSinglePhoto(setNumberPlatePhoto, setNumberPlatePhotoPreview);

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    // Reusable single-photo upload block: label, helper text, preview + remove button
    const PhotoSlot = ({ label, helperText, preview, onSelect, onRemove }) => (
        <div className="transition-all duration-300 ease-in-out">
            <label className="block text-xs font-bold text-slate-500 mb-1">
                {label}
            </label>
            <p className="text-xs text-slate-400 mb-2">{helperText}</p>

            {!preview ? (
                <input
                    type="file"
                    accept="image/*"
                    onChange={onSelect}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                />
            ) : (
                <div className="relative w-24 h-24 animate-[fadeIn_0.3s_ease-in-out]">
                    <img
                        src={preview}
                        alt={label}
                        className="w-24 h-24 object-cover rounded border border-slate-300 shadow-sm transition-all duration-300"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center transition-transform duration-150 hover:scale-110"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
                Driver Registration
            </h3>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Driver Name
                </label>
                <input
                    type="text"
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. Suresh Kadam"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Contact Number
                </label>
                <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. 9876543210"
                    required
                />
            </div>

            {/* Driver photo - goes on the driver's profile, used for identity verification */}
            <PhotoSlot
                label="Driver Photo (required)"
                helperText="This photo goes on your driver profile and is used to verify your identity."
                preview={driverPhotoPreview}
                onSelect={(e) => handleSinglePhotoSelect(e, setDriverPhoto, setDriverPhotoPreview)}
                onRemove={() => removeSinglePhoto(setDriverPhoto, setDriverPhotoPreview)}
            />

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Vehicle Type
                </label>
                <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    required
                >
                    <option value="">Select</option>
                    <option>Autorickshaw</option>
                    <option>Taxi</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Vehicle Number
                </label>
                <input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. MH08 AB 1234"
                    required
                />
            </div>

            {/* Vehicle photo - shown to customers so they can recognize the vehicle */}
            <PhotoSlot
                label="Vehicle Photo (required)"
                helperText="This photo is shown to customers so they can recognize your vehicle."
                preview={vehiclePhotoPreview}
                onSelect={(e) => handleSinglePhotoSelect(e, setVehiclePhoto, setVehiclePhotoPreview)}
                onRemove={() => removeSinglePhoto(setVehiclePhoto, setVehiclePhotoPreview)}
            />

            {/* Number plate photo - used to verify the vehicle registration number */}
            <PhotoSlot
                label="Number Plate Photo (required)"
                helperText="This photo is used to verify your vehicle's registration number."
                preview={numberPlatePhotoPreview}
                onSelect={(e) => handleSinglePhotoSelect(e, setNumberPlatePhoto, setNumberPlatePhotoPreview)}
                onRemove={() => removeSinglePhoto(setNumberPlatePhoto, setNumberPlatePhotoPreview)}
            />

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Base Village / Stand
                </label>
                <input
                    type="text"
                    name="base_village"
                    value={formData.base_village}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. Ganpatipule Stand"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Taluka Name
                </label>
                <input
                    type="text"
                    name="taluka_name"
                    value={formData.taluka_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. Ratnagiri"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Service Area (villages/places you cover)
                </label>
                <textarea
                    name="service_area"
                    value={formData.service_area}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. Ganpatipule, Ratnadurg Fort, Bhatye Beach"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Per-Day Rate
                </label>
                <input
                    type="text"
                    name="per_day_rate"
                    value={formData.per_day_rate}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    placeholder="e.g. ₹1500/day"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Google Maps link of your base stand
                    (Open Google Maps → search location → long press → copy link → paste here)
                </label>
                <input
                    type="url"
                    name="google_maps_link"
                    value={formData.google_maps_link}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-orange-600 text-white rounded-lg disabled:opacity-60 transition-all duration-200 hover:bg-orange-700"
            >
                {uploading ? "Uploading..." : "Submit Driver Registration"}
            </button>

        </form>
    );
}