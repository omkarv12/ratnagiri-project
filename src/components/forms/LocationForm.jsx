import React, { useState, useEffect } from 'react';
import API_BASE_URL from "../../config";
import LocationPicker from "./LocationPicker";
const MIN_PHOTO_SIZE = 500 * 1024;
const DRAFT_KEY = "ratnagiri_location_form_draft";

const STEP_LABELS = [
    "Basic Information",
    "Amenities & Accessibility",
    "Tourism Info & Sustainability",
    "Photos & Feedback",
];

const REQUIRED_BY_STEP = {
    1: ["user_type", "location_name", "village_name", "taluka_name", "district_name"],
    2: ["road_condition", "signboards_available", "public_transport", "parking_space", "food_stalls"],
    3: ["attraction_type", "site_activity_details_doc"],
};

function StepProgress({ step, totalSteps, labels }) {
    return (
        <div className="mb-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Step {step} of {totalSteps}: {labels[step - 1]}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );
}

function Required() {
    return <span className="text-red-600 font-semibold"> *</span>;
}

function InternalTag() {
    return (
        <span className="ml-2 inline-block align-middle text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            Internal use only
        </span>
    );
}

export default function LocationForm({ onSuccess }) {
    const [formData, setFormData] = useState({

    // Basic Information
    user_type: "",
    location_name: "",
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
    email_address: "",
    user_description: "",
    google_maps_link: "",

    // Coordinates
    latitude: null,
    longitude: null,

    // Photos
    site_photos: ""

});

const [step, setStep] = useState(1);
const totalSteps = 4;

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

const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);

    if (selectedPhotos.length + files.length > 5) {
        alert("You can upload a maximum of 5 photos.");
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

const goNext = () => {
    if (step === 1 && (formData.latitude == null || formData.longitude == null)) {
        alert("Please select the location on the map before continuing.");
        return;
    }

    const missing = (REQUIRED_BY_STEP[step] || []).filter((key) => !formData[key]);

    if (missing.length > 0) {
        alert("Please fill in all required fields (marked *) before continuing.");
        return;
    }

    setStep((s) => Math.min(s + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.latitude == null || formData.longitude == null) {
      alert("Please select the location on the map before submitting.");
      return;
  }

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
  site_photos: "",

  // Sustainability
  formal_regulations: "",
  local_residents_involved: "",
  job_type: "",
  suggestions_improvements: "",

  // Contact
  email_address: "",
  user_description: "",
  google_maps_link: "",

});

    setSelectedPhotos([]);
    setPhotoPreviews([]);
    setStep(1);

  } catch (err) {
    alert(err.message);
  } finally {
    setUploading(false);
  }
};


  return (


    <form
    onSubmit={handleSubmit}
    className="space-y-8"
>

<StepProgress step={step} totalSteps={totalSteps} labels={STEP_LABELS} />

{step === 1 ? (

    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-800 mb-1">Before you start</p>
        <p>
            Location and amenity details you submit here may be published on the public Ratnagiri
            Tourism site once reviewed and approved by the department. Fields marked
            <InternalTag /> are seen only by the tourism department and are never published.
        </p>
        <p className="text-xs text-slate-500 mt-2">
            Takes about 6–8 minutes · Fields marked <Required /> are required to continue.
        </p>
    </div>

) : (

    <p className="text-xs text-slate-500 -mt-4">
        Reminder: public location details may be published once approved; fields marked
        <InternalTag /> stay private with the department.
    </p>

)}

{step === 1 && (
<>

<div>
<h3 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 1 : Basic Information
</h3>
<p className="text-xs text-slate-500 mt-2 mb-2">
    Helps us map and catalog this location accurately.
</p>
</div>


<div className="space-y-6">

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    What Best Describes You?<Required />
  </label>

  <select
    name="user_type"
    value={formData.user_type}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
        <label className="block text-xs font-bold text-slate-500 mb-1">
          Name of Location<Required />
        </label>

        <input
  type="text"
  name="location_name"
  value={formData.location_name}
  onChange={handleChange}
  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  required
  placeholder="e.g. Unhavare Hot Water Springs"
/>
      </div>

<div>

<label className="block text-sm font-semibold text-slate-700 mb-3">

Located In

</label>

<div className="space-y-2">

<label className="flex items-center gap-2">

<input
type="radio"
name="located_in"
value="Village"
checked={formData.located_in === "Village"}
onChange={handleChange}
/>


Village

</label>

<label className="flex items-center gap-2">

<input
type="radio"
name="located_in"
value="Town"
checked={formData.located_in === "Town"}
onChange={handleChange}
/>

Town

</label>

<label className="flex items-center gap-2">

<input
type="radio"
name="located_in"
value="City"
checked={formData.located_in === "City"}
onChange={handleChange}
/>

City

</label>

</div>

</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Village Name<Required />
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
          Taluka<Required />
        </label>

        <input
  type="text"
  name="taluka_name"
  value={formData.taluka_name}
  onChange={handleChange}
  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  required
  placeholder="e.g. Dapoli"
/>
      </div>


<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    District<Required />
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
    Location on Map<Required />
  </label>

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
</div>




<div className="col-span-2">

  <h3 className="text-lg font-bold text-slate-800 mb-3">
    Managed and Owned By
  </h3>

  <div>

    <label className="block text-sm font-semibold text-slate-700 mb-3">
      Owned By
    </label>

    <div className="space-y-2 mb-6">

      {["Government", "Private", "Community", "Public", "Open"].map((item) => (

        <label key={item} className="flex items-center gap-2">

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

    <label className="block text-sm font-semibold text-slate-700 mb-3">
      Managed By
    </label>

    <div className="space-y-2">

      {[
        "Gram Panchayat",
        "MTDC",
        "Private",
        "Community Based",
        "Public",
        "Government",
        "Open",
      ].map((item) => (

        <label key={item} className="flex items-center gap-2">

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


<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Nearest Landmark
  </label>

  <input
    type="text"
    name="nearest_landmark"
    value={formData.nearest_landmark}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. Near Murud Beach"
  />
</div>

</div>

</>
)}


{step === 2 && (
<>

<div>
<h2 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 2 : Amenities & Accessibility
  </h2>
<p className="text-xs text-slate-500 mt-2 mb-2">
    Used to advise visitors and prioritize where the district should invest in facilities.
</p>
</div>


<h3 className="text-lg font-bold text-slate-800 mb-2">
  Location Amenities
</h3>

<div className="mb-6">

  <label className="block text-xs font-bold text-slate-500 mb-3">
    Amenities Available
  </label>

  <div className="space-y-2">

    {[
      "Washrooms",
      "Drinking Water",
      "Informative Boards",
      "First Aid Kit",
      "Sitting Area"
    ].map((item) => (

      <label key={item} className="flex items-center gap-3">

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
                amenities_available: current.filter(
                  (value) => value !== item
                ),
              });
            }

          }}
        />

        <span>{item}</span>

      </label>

    ))}

  </div>

</div>


<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Road Condition<Required />
  </label>

  <select
    name="road_condition"
    value={formData.road_condition}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Signboards Available<Required />
  </label>

  <select
    name="signboards_available"
    value={formData.signboards_available}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    required
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Public Transport Available<Required />
  </label>

  <select
    name="public_transport"
    value={formData.public_transport}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    required
  >
    <option value="">Select</option>
    <option value="Bus">Available and Frequent</option>
    <option value="Train">Available but Infrequent</option>
    <option value="Both">Not Available</option>
  </select>
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Nearest Bus Stand
  </label>

  <input
    type="text"
    name="nearest_bus_stand"
    value={formData.nearest_bus_stand}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. Dapoli Bus Stand"
  />
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Nearest Railway Station
  </label>

  <input
    type="text"
    name="nearest_railway_station"
    value={formData.nearest_railway_station}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. Khed Railway Station"
  />
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Parking Space Available<Required />
  </label>

  <select
    name="parking_space"
    value={formData.parking_space}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    required
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Food Stalls Available<Required />
  </label>

  <select
    name="food_stalls"
    value={formData.food_stalls}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    required
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

</>
)}


{step === 3 && (
<>

<div>
  <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 3 : Tourism Information & Sustainability
  </h2>
  <p className="text-xs text-slate-500 mt-2 mb-2">
    Helps us understand visitor patterns and manage crowding sustainably, and see where
    local communities are (or aren't) benefiting economically.
  </p>
</div>



<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Type of Attraction<Required />
  </label>

  <select
    name="attraction_type"
    value={formData.attraction_type}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
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
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Entry Fee
  </label>

  <select
    name="entry_fee"
    value={formData.entry_fee}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Entry Fee Amount
  </label>

  <input
    type="text"
    name="entry_fee_amount"
    value={formData.entry_fee_amount}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. 20 Rs."
  />
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Visiting Hours
  </label>

  <input
    type="text"
    name="visiting_hours"
    value={formData.visiting_hours}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. 8 AM - 6 PM"
  />
</div>

<div className="mb-6">

  <label className="block text-xs font-bold text-slate-500 mb-3">
    Seasonal Availability
  </label>

  <div className="space-y-2">

    {[
      "Open All Year",
      "Seasonal",
    ].map((option) => (

      <label
        key={option}
        className="flex items-center gap-3"
      >

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
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Peak Period
  </label>

  <input
    type="text"
    name="peak_period"
    value={formData.peak_period}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. October - February"
  />
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Average Engagement Time
  </label>

  <input
    type="text"
    name="avg_time_spent"
    value={formData.avg_time_spent}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. 2 Hours"
  />
</div>

<div className="mb-6">

  <label className="block text-xs font-bold text-slate-500 mb-3">
    Visitor Type
  </label>

  <div className="space-y-2">

    {[
      "Weekend Visitors",
      "Day Visitors",
      "Groups",
      "Families",
      "Researchers",
      "Students",
      "Trekkers",
    ].map((option) => (

      <label
        key={option}
        className="flex items-center gap-3"
      >

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
                visitor_type: current.filter(
                  (item) => item !== option
                ),
              });

            }

          }}
        />

        <span>{option}</span>

      </label>

    ))}

  </div>

</div>




<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Is it crowded or not?
  </label>

  <select
    name="is_crowded"
    value={formData.is_crowded}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Crowd Level
  </label>

  <select
    name="crowd_level"
    value={formData.crowd_level}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  >
    <option value="">Select</option>
    <option value="Low">Low(0-25 Tourists)</option>
    <option value="Medium">Medium(26-75 Tourists)</option>
    <option value="High">High(More than 75 Tourists)</option>
  </select>
</div>


<div className="mb-6">

  <label className="block text-xs font-bold text-slate-500 mb-3">
    Formal Regulations. Are there any formal regultions for visitors ? (e.g. Visiting hours, no plastic, dress code etc)
  </label>

  <div className="space-y-2">

    {[
      "Yes",
      "No",
    ].map((option) => (

      <label
        key={option}
        className="flex items-center gap-3"
      >

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

</div>

<div className="mb-6">

  <label className="block text-xs font-bold text-slate-500 mb-3">
    Site Activities
  </label>

  <div className="space-y-2">

    {[
      "Traditional Food",
      "Cultural Event",
      "Community Experience",
      "Nature Walk",
      "Other",
    ].map((option) => (

      <label
        key={option}
        className="flex items-center gap-3"
      >

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

</div>


<div className="mb-6">

  <label className="block text-xs font-bold text-slate-500 mb-2">
  Activity Details (Description, Conducted By & Photos)<Required />
</label>

  <input
    type="url"
    name="site_activity_details_doc"
    value={formData.site_activity_details_doc}
    onChange={handleChange}
    placeholder="Paste Google Docs link"
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    required
  />


</div>




<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Are local residents involved in employment or income-generating activities at this location?
  </label>

  <select
    name="local_residents_involved"
    value={formData.local_residents_involved}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    If yes (Job type)
    <InternalTag />
  </label>

  <input
    type="text"
    name="job_type"
    value={formData.job_type}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="e.g. Guide, Boat Service, Food Stall"
  />
</div>

</>
)}


{step === 4 && (
<>

<div>
  <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 4 : Photos & Feedback
  </h2>
  <p className="text-xs text-slate-500 mt-2 mb-2">
    Photos help visitors discover this place; your note goes directly to the tourism department.
  </p>
</div>

<div className="mb-8">

    <label className="block text-xs font-bold text-slate-500 mb-2">
        Location Photos (up to 5, min 500 KB each)
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
    Suggestions / Improvements
    <InternalTag />
  </label>

  <textarea
    name="suggestions_improvements"
    value={formData.suggestions_improvements}
    onChange={handleChange}
    rows="3"
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="Suggestions for improving the tourist destination"
  />
</div>

</>
)}


<div className="flex items-center justify-between pt-4 border-t border-slate-200">

  {step > 1 ? (
    <button
      type="button"
      onClick={goBack}
      className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
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
      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
    >
      Next
    </button>
  ) : (
    <button
      type="submit"
      disabled={uploading}
      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
    >
      {uploading ? "Uploading..." : "Submit Profile Data"}
    </button>
  )}

</div>

    </form>
  );
}