import React, { useState } from 'react';
import API_BASE_URL from "../../config";

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

    // Photos
    photo_location: "",
    site_photos: ""

});

const [selectedPhotos, setSelectedPhotos] = useState([]);


const handleFileChange = (e) => {

  const newFiles = Array.from(e.target.files);

  setSelectedPhotos((prev) => [
    ...prev,
    ...newFiles,
  ]);

  setFormData((prev) => ({
    ...prev,
    site_photos: [
      ...(prev.site_photos || []),
      ...newFiles,
    ],
  }));

};


const removePhoto = (index) => {

  const updatedPhotos = selectedPhotos.filter(
    (_, i) => i !== index
  );

  setSelectedPhotos(updatedPhotos);

  setFormData((prev) => ({
    ...prev,
    site_photos: updatedPhotos,
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
    `${API_BASE_URL}/api/locations/register`,
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
  crowd_level: "",
  site_activities: "",
  site_activity_details_doc: "",
  site_photos: [],

  // Sustainability
  formal_regulations: "",
  local_residents_involved: "",
  job_type: "",
  suggestions_improvements: "",

  // Contact
  email_address: "",
  user_description: "",
  google_maps_link: "",

  // Photos
  photo_location: "",

});

  } catch (err) {
    alert(err.message);
  }
};

  
  return (


    <form
    onSubmit={handleSubmit}
    className="space-y-8"
>



<h3 className="text-xl font-bold text-slate-800 border-b pb-2">

    Section 1 : Basic Information

</h3>


<div className="space-y-6">

<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    What Best Describes You?
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
          Name of Location
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
    Village Name
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
          Taluka
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
    District
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

    <label className="block text-xs font-bold text-slate-500 mb-2">
        Photo of the location (Google Drive Folder Link)
    </label>

    <input
        type="text"
        name="photo_location"
        placeholder="Paste the Google Drive folder link"
        value={formData.photo_location || ""}
        onChange={(e) =>
            setFormData({
                ...formData,
                photo_location: e.target.value
            })
        }
        className="w-full rounded-lg border border-slate-300 px-4 py-2
        focus:outline-none focus:ring-2 focus:ring-orange-500"
    />

</div>



<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Google Map link of the location
(Please follow these steps - Open google maps  - search location - long press on the screen - copy the link - paste here)
  </label>

  <input
    type="url"
    name="google_maps_link"
    value={formData.google_maps_link}
    onChange={handleChange}
    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
    placeholder="https://maps.google.com/..."
  />
</div>




<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    
<div>

<label className="block text-sm font-semibold text-slate-700 mb-3">

Owned By

</label>

<div className="space-y-2">

{["Government","Private","Community","Public"].map((item)=>(

<label key={item} className="flex items-center gap-2">

<input

type="radio"

name="owned_by"

value={item}

checked={formData.owned_by===item}

onChange={handleChange}

/>

{item}

</label>

))}

</div>

</div>


  </label>

  
</div>




<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
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
"Public"
].map((item)=>(

<label key={item} className="flex items-center gap-2">

<input

type="radio"

name="managed_by"

value={item}

checked={formData.managed_by===item}

onChange={handleChange}

/>

{item}

</label>

))}

</div>

</div>  </label>

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



      

      


        


      

      








<div className="col-span-2 mt-8">
  <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 2 : Amenities & Accessibility
  </h2>
</div>


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
    Road Condition
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
    Signboards Available
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
    Public Transport Available
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
    Parking Space Available
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
    Food Stalls Available
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



<div className="mt-10">
  <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
    Section 3 : Tourism Information & Sustainability
  </h2>

</div>



<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Type of Attraction
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
  Activity Details (Description, Conducted By & Photos)
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



<div className="mb-8">


<div className="mb-8">

    <label className="block text-xs font-bold text-slate-500 mb-2">
        Google Drive Folder Link (Tourist Attraction Photos)
    </label>

    <input
        type="text"
        name="site_photos"
        placeholder="Paste the Google Drive folder link containing attraction, amenities and activity photos"
        value={formData.site_photos || ""}
        onChange={(e) =>
            setFormData({
                ...formData,
                site_photos: e.target.value
            })
        }
        className="w-full rounded-lg border border-slate-300 px-4 py-2
        focus:outline-none focus:ring-2 focus:ring-orange-500"
    />

</div>
  

</div>


<div>
  <label className="block text-xs font-bold text-slate-500 mb-1">
    Suggestions / Improvements
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






      {/* <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">
          Upload Photo
        </label>

        <div>



<input

type="file"

name="site_photos"

onChange={(e)=>
setFormData({
...formData,
site_photos:e.target.files[0]
})
}

/>



</div>
      </div> */}

      <button
        type="submit"
        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
      >
        Submit Profile Data
      </button>

    </form>
  );
}

















