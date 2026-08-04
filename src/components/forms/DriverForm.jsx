import React, { useState } from "react";
import API_BASE_URL from "../../config";

const MAX_PHOTO_SIZE = 500 * 1024; // 500 KB

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
        vehicle_photos: "",
    });

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);

        if (selectedPhotos.length + files.length > 5) {
            alert("You can upload a maximum of 5 photos.");
            e.target.value = "";
            return;
        }

        const tooLarge = files.filter((file) => file.size > MAX_PHOTO_SIZE);

        if (tooLarge.length > 0) {
            alert(
                `These photos are larger than 500 KB and were skipped: ${tooLarge
                    .map((f) => f.name)
                    .join(", ")}`
            );
        }

        const validFiles = files.filter((file) => file.size <= MAX_PHOTO_SIZE);

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

    const uploadPhotos = async () => {
        const uploadedUrls = [];

        for (const file of selectedPhotos) {
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

            uploadedUrls.push(data.url);
        }

        return uploadedUrls;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);

            let photoUrls = [];
            if (selectedPhotos.length > 0) {
                photoUrls = await uploadPhotos();
            }

            const payload = {
                ...formData,
                vehicle_photos: photoUrls.join(","),
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
                vehicle_photos: "",
            });

            setSelectedPhotos([]);
            setPhotoPreviews([]);

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>

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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. 9876543210"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Vehicle Type
                </label>
                <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. MH08 AB 1234"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Base Village / Stand
                </label>
                <input
                    type="text"
                    name="base_village"
                    value={formData.base_village}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. ₹1500/day"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                    Vehicle Photos (up to 5, min 500 KB each)
                </label>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                />

                <p className="text-xs text-slate-400 mt-1">
                    {selectedPhotos.length}/5 photos selected
                </p>

                {photoPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                        {photoPreviews.map((src, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={src}
                                    alt={`preview-${index}`}
                                    className="w-20 h-20 object-cover rounded border border-slate-300"
                                />
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
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-orange-600 text-white rounded-lg disabled:opacity-60"
            >
                {uploading ? "Uploading..." : "Submit Driver Registration"}
            </button>

        </form>
    );
}