import React, { useState } from "react";
import API_BASE_URL from "../../config";

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
        homestay_photos: "",
        price_range: "",
        activity_details_doc: "",
        suggestions_query: "",

    });
    const [selectedHomestayPhotos, setSelectedHomestayPhotos] = useState([]);

    const handleHomestayPhotos = (e) => {

    const newPhotos = Array.from(e.target.files);

    setSelectedHomestayPhotos((prev) => [
        ...prev,
        ...newPhotos,
    ]);

    setFormData((prev) => ({
        ...prev,
        site_photos: [
            ...(prev.site_photos || []),
            ...newPhotos,
        ],
    }));

};


const removeHomestayPhoto = (index) => {

    const updated = selectedHomestayPhotos.filter(
        (_, i) => i !== index
    );

    setSelectedHomestayPhotos(updated);

    setFormData((prev) => ({
        ...prev,
        site_photos: updated,
    }));

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

        const response = await fetch(
            `${API_BASE_URL}/api/homestays/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
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
            homestay_photos: "",
            price_range: "",
            activity_details_doc: "",
            suggestions_query: "",

        });

    } catch (err) {

        console.error(err);

        alert(err.message);

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
    Photo of the Homestay (Google Drive Folder Link)
  </label>

  <input
    type="text"
    name="site_photos"
    placeholder="Paste the Google Drive folder link containing homestay photos"
    value={formData.site_photos || ""}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  />

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

    <label className="block text-xs font-bold text-slate-500 mb-2">
        Additional Homestay Photos (Google Drive Folder Link)
    </label>

    <input
        type="text"
        name="additional_homestay_photos"
        placeholder="Paste the Google Drive folder link containing additional homestay photos"
        value={formData.additional_homestay_photos || ""}
        onChange={handleChange}
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
                className="w-full py-3 bg-orange-600 text-white rounded-lg"
            >
                Submit Homestay
            </button>

        </form>

    );

}