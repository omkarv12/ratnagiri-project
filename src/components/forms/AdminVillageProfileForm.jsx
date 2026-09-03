import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { adminSaveVillageProfile } from "../../api/blogApi";
import API_BASE_URL from "../../config";

function RepeatableImageBlock({ items, setItems, fields }) {
  const addItem = () => setItems([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  const updateItem = (idx, key, value) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [key]: value };
    setItems(copy);
  };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const uploadImage = async (idx, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) updateItem(idx, "image", data.url);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="border rounded-lg p-3 space-y-2 bg-slate-50">
          {fields.map((f) =>
            f.key === "image" ? (
              <div key={f.key}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && uploadImage(idx, e.target.files[0])}
                  className="text-xs"
                />
                {item.image && <img src={item.image} alt="" className="h-16 mt-1 rounded object-cover" />}
              </div>
            ) : (
              <input
                key={f.key}
                type="text"
                placeholder={f.label}
                value={item[f.key] || ""}
                onChange={(e) => updateItem(idx, f.key, e.target.value)}
                className="w-full border rounded p-2 text-sm"
              />
            )
          )}
          <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs flex items-center gap-1">
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-orange-600 text-xs font-semibold flex items-center gap-1">
        <Plus size={14} /> Add
      </button>
    </div>
  );
}



const SERVICE_COLORS = [
  { value: "emerald", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "amber", label: "Yellow" },
  { value: "orange", label: "Orange" },
  { value: "rose", label: "Pink" },
  { value: "teal", label: "Teal" },
];

function ServiceCategoryEditor({ services, setServices }) {
  const addCategory = () =>
    setServices([...services, { title: "", icon: "🛎️", color: "emerald", items: [], photos: [] }]);

  const updateCategory = (idx, field, value) => {
    const copy = [...services];
    copy[idx] = { ...copy[idx], [field]: value };
    setServices(copy);
  };

  const removeCategory = (idx) => setServices(services.filter((_, i) => i !== idx));

  const uploadPhoto = async (idx, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) {
      const copy = [...services];
      copy[idx] = { ...copy[idx], photos: [...(copy[idx].photos || []), data.url] };
      setServices(copy);
    }
  };

  const removePhoto = (catIdx, photoIdx) => {
    const copy = [...services];
    copy[catIdx] = { ...copy[catIdx], photos: copy[catIdx].photos.filter((_, i) => i !== photoIdx) };
    setServices(copy);
  };

  return (
    <div className="space-y-4">
      {services.map((cat, idx) => (
        <div key={idx} className="border rounded-xl p-4 bg-slate-50 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              placeholder="Category title (e.g. Food Services)"
              value={cat.title}
              onChange={(e) => updateCategory(idx, "title", e.target.value)}
              className="border rounded-lg p-2 text-sm sm:col-span-2"
            />
            <input
              placeholder="Icon (emoji)"
              value={cat.icon}
              onChange={(e) => updateCategory(idx, "icon", e.target.value)}
              className="border rounded-lg p-2 text-sm"
            />
          </div>

          <select
            value={cat.color}
            onChange={(e) => updateCategory(idx, "color", e.target.value)}
            className="border rounded-lg p-2 text-sm"
          >
            {SERVICE_COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <textarea
            placeholder={"Services offered, one per line:\nBreakfast service\nSeafood meals\nTea stall"}
            value={(cat.items || []).join("\n")}
            onChange={(e) => updateCategory(idx, "items", e.target.value.split("\n"))}
            rows={4}
            className="w-full border rounded-lg p-2 text-sm font-mono"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Photos</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && uploadPhoto(idx, e.target.files[0])}
              className="text-xs mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {(cat.photos || []).map((url, pIdx) => (
                <div key={pIdx} className="relative">
                  <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx, pIdx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeCategory(idx)}
            className="text-red-500 text-xs font-semibold flex items-center gap-1"
          >
            <Trash2 size={12} /> Remove Category
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addCategory}
        className="text-orange-600 text-sm font-semibold flex items-center gap-1"
      >
        <Plus size={14} /> Add Service Category
      </button>
    </div>
  );
}


export default function AdminVillageProfileForm({ onSaved }) {
  const [talukaName, setTalukaName] = useState("");
  const [villageName, setVillageName] = useState("");
  const [tagline, setTagline] = useState("");
  const [introText, setIntroText] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [topAttractions, setTopAttractions] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [howToReachRoad, setHowToReachRoad] = useState("");
  const [howToReachRail, setHowToReachRail] = useState("");
  const [howToReachAir, setHowToReachAir] = useState("");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [sustainabilityTips, setSustainabilityTips] = useState([]);
  const [stayOptionsText, setStayOptionsText] = useState("");
  const [stayOptionsImage, setStayOptionsImage] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [services, setServices] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const uploadHero = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) setHeroImage(data.url);
  };

  const uploadStayImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) setStayOptionsImage(data.url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!talukaName.trim() || !villageName.trim()) {
      setError("Taluka and village name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await adminSaveVillageProfile({
        taluka_name: talukaName.trim(),
        village_name: villageName.trim(),
        tagline, intro_text: introText, about_text: aboutText, hero_image: heroImage,
        top_attractions: topAttractions,
        experiences: experiences,
        services: services,
        how_to_reach_road: howToReachRoad,
        how_to_reach_rail: howToReachRail,
        how_to_reach_air: howToReachAir,
        best_time_to_visit: bestTimeToVisit,
        sustainability_tips: sustainabilityTips,
        stay_options_text: stayOptionsText,
        stay_options_image: stayOptionsImage,
        hashtags,
      });
      setSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <h2 className="text-lg font-bold text-slate-800">Village Profile Editor</h2>

      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Taluka name (exact match)" value={talukaName} onChange={(e) => setTalukaName(e.target.value)} className="border rounded-lg p-2.5 text-sm" />
        <input placeholder="Village name (exact match)" value={villageName} onChange={(e) => setVillageName(e.target.value)} className="border rounded-lg p-2.5 text-sm" />
      </div>

      <input placeholder="Tagline (e.g. A Village Full of Experiences)" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
      <textarea placeholder="Intro text" value={introText} onChange={(e) => setIntroText(e.target.value)} rows={2} className="w-full border rounded-lg p-2.5 text-sm" />
      <textarea placeholder="About the village" value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={3} className="w-full border rounded-lg p-2.5 text-sm" />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Image</label>
        <input type="file" accept="image/*" onChange={uploadHero} />
        {heroImage && <img src={heroImage} alt="" className="h-24 mt-2 rounded-lg" />}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Top Attractions</label>
        <RepeatableImageBlock
          items={topAttractions}
          setItems={setTopAttractions}
          fields={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }, { key: "image", label: "Image" }]}
        />
      </div>

            <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Experiences to Enjoy</label>
        <RepeatableImageBlock items={experiences} setItems={setExperiences} fields={[{ key: "title", label: "Experience name" }]} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Services We Promote at Village Level</label>
        <ServiceCategoryEditor services={services} setServices={setServices} />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <input placeholder="How to Reach — By Road" value={howToReachRoad} onChange={(e) => setHowToReachRoad(e.target.value)} className="border rounded-lg p-2.5 text-sm" />
        <input placeholder="How to Reach — By Rail" value={howToReachRail} onChange={(e) => setHowToReachRail(e.target.value)} className="border rounded-lg p-2.5 text-sm" />
        <input placeholder="How to Reach — By Air" value={howToReachAir} onChange={(e) => setHowToReachAir(e.target.value)} className="border rounded-lg p-2.5 text-sm" />
      </div>

      <input placeholder="Best time to visit" value={bestTimeToVisit} onChange={(e) => setBestTimeToVisit(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Sustainable Tourism Tips</label>
        <RepeatableImageBlock items={sustainabilityTips} setItems={setSustainabilityTips} fields={[{ key: "title", label: "Tip (e.g. Do Not Litter)" }]} />
      </div>

      <textarea placeholder="Stay options description" value={stayOptionsText} onChange={(e) => setStayOptionsText(e.target.value)} rows={2} className="w-full border rounded-lg p-2.5 text-sm" />
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Stay Options Image</label>
        <input type="file" accept="image/*" onChange={uploadStayImage} />
        {stayOptionsImage && <img src={stayOptionsImage} alt="" className="h-24 mt-2 rounded-lg" />}
      </div>

      <input placeholder="#Hashtags (space separated)" value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Saved successfully.</p>}

      <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save Village Profile"}
      </button>
    </form>
  );
}