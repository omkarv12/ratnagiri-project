import React, { useState } from "react";
import API_BASE_URL from "../../config";

const MAX_PHOTO_SIZE = 500 * 1024; // 500 KB

export default function HomestayForm({ onSuccess }) {

    const [formData, setFormData] = useState({

        homestay_name: "",
        owner_name: "",
        phone_number: "",
        situated_in: "",
        village_name: "",
        taluka_name: "",
        district_name: "Ratnagiri",
        live_on_premises: "",
        homestay_type: "",
        homestay_unit_type: "",
        google_maps_discoverable: "",
        google_maps_link: "",
        mtdc_registered: "",
        booking_method: "",
        booking_app_name: "",
        listed_on_booking_platform: "",
        price_list: "",
        facilities_services: [],
        digital_payment: "",
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
        suggestions_query: "",
        site_photos: "",

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

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

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
            situated_in: "",
            village_name: "",
            taluka_name: "",
            district_name: "Ratnagiri",

            live_on_premises: "",
            homestay_type: "",
            homestay_unit_type: "",
            google_maps_discoverable: "",
            google_maps_link: "",
            mtdc_registered: "",

            booking_method: "",
            booking_app_name: "",
            listed_on_booking_platform: "",
            price_list: "",

            facilities_services: [],
            digital_payment: "",
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
            suggestions_query: "",
            site_photos: "",

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

        <form
            className="space-y-4"
            onSubmit={handleSubmit}
        >

            <h3 className="text-xl font-bold text-slate-800 border-b pb-2">

                Section 1 : Basic Information

            </h3>

            

            <div className="space-y-6">


                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Name of Homestay
                </label>

                <input
                    type="text"
                    name="homestay_name"
                    value={formData.homestay_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Sea View Homestay"
                    required
                />

            </div>

            <div>

                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Name of Homestay Owner
                </label>

                <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Ramesh Patil"
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

    <label className="block text-sm font-semibold text-slate-700 mb-3">
        Homestay Situated In
    </label>

    <div className="space-y-2">

        {[
            "Village",
            "Town",
            "City",
        ].map((option) => (

            <label
                key={option}
                className="flex items-center gap-3"
            >

                <input
                    type="radio"
                    name="situated_in"
                    value={option}
                    checked={formData.situated_in === option}
                    onChange={handleChange}
                    required
                />

                <span>{option}</span>

            </label>

        ))}

    </div>

</div>

            <div>

                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Village / Town / City Name
                </label>

                <input
                    type="text"
                    name="village_name"
                    value={formData.village_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Kelshi"
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
                    placeholder="e.g. Dapoli"
                    required
                />

            </div>

            <div>

                <label className="block text-xs font-bold text-slate-500 mb-1">
                    District Name
                </label>

                <input
                    type="text"
                    name="district_name"
                    value={formData.district_name}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                    required
                />

            </div>

            <div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Do you live on the Homestay premises?
    </label>

    <select
        name="live_on_premises"
        value={formData.live_on_premises}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        What type of Homestay do you have?
    </label>

    <select
        name="homestay_type"
        value={formData.homestay_type}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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

    <label className="block text-xs font-bold text-slate-500 mb-1">
        What type of Homestay Unit do you have?
    </label>

    <select
        name="homestay_unit_type"
        value={formData.homestay_unit_type}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Can the Homestay be discovered on Google Maps?
    </label>

    <select
        name="google_maps_discoverable"
        value={formData.google_maps_discoverable}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>



<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Enter the Google Map link of the homestay 
(Please follow these steps - Open google maps  - search location - long press on the screen - copy the link - paste here)
    </label>

    <input
        type="url"
        name="google_maps_link"
        value={formData.google_maps_link}
        onChange={handleChange}
        placeholder="https://maps.google.com/..."
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    />

</div>


<div>

    <label className="block text-xs font-bold text-slate-500 mb-2">
        Homestay Photos (up to 5, min 500 KB each)
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
        Are you registered with MTDC?
    </label>

    <select
        name="mtdc_registered"
        value={formData.mtdc_registered}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>

<div className="col-span-2 mt-8">
  <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 2 : Amenities & Accessibility
  </h2>
</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        How can tourists book your homestay?
    </label>

    <select
        name="booking_method"
        value={formData.booking_method}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Phone Call</option>
        <option>WhatsApp</option>
        <option>Online</option>
    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        If Booking by App (Specify App Name)
    </label>

    <input
        type="text"
        name="booking_app_name"
        value={formData.booking_app_name}
        onChange={handleChange}
        placeholder="e.g. Airbnb"
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    />

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Is your homestay listed on Booking.com / Airbnb?
    </label>

    <select
        name="listed_on_booking_platform"
        value={formData.listed_on_booking_platform}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>


<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Type of Rooms
    </label>

    <select
        name="room_type"
        value={formData.room_type}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >

        <option value="">
            Select
        </option>

        <option value="Deluxe">
            Deluxe
        </option>

        <option value="AC">
            AC
        </option>

        <option value="Non-AC">
            Non-AC
        </option>

    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Price Range (According to Type of Rooms)
    </label>

    <input
        type="text"
        name="price_range"
        value={formData.price_range}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        placeholder="e.g. Deluxe: ₹3500/night, AC: ₹2500/night, Non-AC: ₹1800/night"
        required
    />

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-3">
        Which of the following facilities and services are provided by your homestay?
    </label>

    <div className="space-y-2">

        {[
            "Breakfast",
            "Lunch",
            "Dinner",
            "WiFi",
            "Power Backup",
            "Parking",
            "Hot Water",
        ].map((facility) => (

            <label
                key={facility}
                className="flex items-center gap-3"
            >

                <input
                    type="checkbox"
                    value={facility}
                    checked={
                        formData.facilities_services?.includes(facility) || false
                    }
                    onChange={(e) => {

                        const updated = e.target.checked
                            ? [
                                ...(formData.facilities_services || []),
                                facility,
                              ]
                            : (formData.facilities_services || []).filter(
                                (item) => item !== facility
                              );

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

</div>




<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Do you accept digital payments (UPI)?
    </label>

    <select
        name="digital_payment"
        value={formData.digital_payment}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>


<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Check-In and Check-Out Time
    </label>

    <input
        type="text"
        name="check_in_out_time"
        value={formData.check_in_out_time}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        placeholder="e.g. Check-In: 12:00 PM | Check-Out: 10:00 AM"
        required
    />

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Cancellation Policy
    </label>

    <textarea
        name="cancellation_policy"
        value={formData.cancellation_policy}
        onChange={handleChange}
        rows={3}
        placeholder="Describe your cancellation policy..."
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    />

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Do you provide Vegetarian Meals?
    </label>

    <select
        name="vegetarian_meals"
        value={formData.vegetarian_meals}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Do you provide Non-Vegetarian Meals?
    </label>

    <select
        name="non_vegetarian_meals"
        value={formData.non_vegetarian_meals}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        What are the major tourist attractions / places near your homestay?
    </label>

    <textarea
        name="nearby_attractions"
        value={formData.nearby_attractions}
        onChange={handleChange}
        rows={3}
        placeholder="e.g. Murud Beach, Keshavraj Temple, Suvarnadurg Fort"
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    />

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Do you provide any guidance to reach these places?
    </label>

    <select
        name="guidance_available"
        value={formData.guidance_available}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Do you have guides available to assist tourists?
    </label>

    <select
        name="guides_available"
        value={formData.guides_available}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    >
        <option value="">Select</option>
        <option>Yes</option>
        <option>No</option>
    </select>

</div>

<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Local Experiences Offered to Tourists
    </label>

    <select
        name="local_experiences"
        value={formData.local_experiences}
        onChange={handleChange}
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    >

        <option value="">
            Select
        </option>

        <option value="Traditional Food">
            Traditional Food
        </option>

        <option value="Cultural Event">
            Cultural Event
        </option>

        <option value="Community Experience">
            Community Experience
        </option>

        <option value="Nature Walk">
            Nature Walk
        </option>

        <option value="Other">
            Other
        </option>

    </select>

</div>



<div>

    <label className="block text-xs font-bold text-slate-500 mb-2">
        Activity Details (Description, Conducted By & Photos)
    </label>

    <input
        type="url"
        name="activity_details_doc"
        value={formData.activity_details_doc}
        onChange={handleChange}
        placeholder="https://docs.google.com/document/d/xxxxxxxxxxxxxxxxxxxxxxxx/edit"
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    />


</div>



<div>

    <label className="block text-xs font-bold text-slate-500 mb-1">
        Homestay's own booking website (If any provide link)
    </label>

    <input
        type="text"
        name="social_media_link"
        value={formData.social_media_link}
        onChange={handleChange}
        placeholder="Paste link or type 'No'"
        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
        required
    />

</div>


<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Suggestions / Query
  </label>

  <textarea
    name="suggestions_improvements"
    value={formData.suggestions_improvements}
    onChange={handleChange}
    rows="3"
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="Query regarding Registration or Approval"
  />
</div>




            <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-orange-600 text-white rounded-lg disabled:opacity-60"
            >
                {uploading ? "Uploading..." : "Submit Homestay"}
            </button>

        </form>

    );

}