import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
import { GUIDE_LANGUAGES } from "../utils/guideLanguages";

const MAX_PHOTO_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EMPTY = {
  guide_name: "",
  phone_number: "",
  email: "",
  destinations: "",
  base_village: "",
  taluka_name: "",
  district_name: "Ratnagiri",
  experience_years: "",
  license_number: "",
  about: "",
  website: "", // honeypot: real users never see or fill this
};

export default function GuideRegister() {
  const [form, setForm] = useState(EMPTY);
  const [languages, setLanguages] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [stage, setStage] = useState(""); // "", "uploading", "saving"
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const submitting = stage !== "";

  // Clean up the preview URL when it changes or the page unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleLanguage = (code) =>
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Photo must be a JPG, PNG or WebP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Photo must be smaller than ${MAX_PHOTO_MB} MB.`);
      e.target.value = "";
      return;
    }
    setError("");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    if (!form.guide_name.trim()) return "Please enter your full name.";
    if (form.phone_number.replace(/\D/g, "").length < 10)
      return "Please enter a valid 10-digit phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (languages.length === 0) return "Select at least one language you speak.";
    if (!form.destinations.trim()) return "List the destinations you guide at.";
    if (!form.base_village.trim() || !form.taluka_name.trim())
      return "Please enter your base village and taluka.";
    if (form.experience_years === "" || Number(form.experience_years) < 0)
      return "Please enter your years of experience.";
    if (!photo) return "Please upload a clear photo of yourself.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");

    try {
      // Step 1: upload the photo to Cloudinary through the existing endpoint
      setStage("uploading");
      const fd = new FormData();
      fd.append("photo", photo);
      const up = await fetch(`${API_BASE_URL}/api/upload-photo`, { method: "POST", body: fd });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok || !upData.url) {
        throw new Error(upData.error || "Photo upload failed. Please try again.");
      }

      // Step 2: register the guide with the uploaded photo's URL
      setStage("saving");
      const payload = {
        ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v).trim()])),
        languages: languages.join(","),
        guide_photo: upData.url,
      };
      const res = await fetch(`${API_BASE_URL}/api/guides/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Registration failed. Please try again.");

      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setStage("");
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Thank you for registering!</h1>
        <p className="text-gray-600 mb-6">
          Your details have been submitted for review. Once the tourism department approves
          your profile, you will appear on the Tourist Guides page.
        </p>
        <Link
          to="/guides"
          className="inline-block px-5 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
        >
          Back to Tourist Guides
        </Link>
      </div>
    );
  }

  const input = "w-full border rounded px-3 py-2";
  const label = "block text-sm font-semibold text-gray-700 mb-1";

  const buttonText =
    stage === "uploading"
      ? "Uploading photo..."
      : stage === "saving"
      ? "Submitting..."
      : "Submit registration";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/guides" className="text-sm text-teal-700 hover:underline">
        &larr; Tourist Guides
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-2">Register as a Tourist Guide</h1>
      <p className="text-gray-600 mb-8">
        Fill in your details. Your profile will be shown to tourists after it is approved.
        Fields marked * are required.
      </p>

      <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-5">
        {/* Honeypot: hidden from people, bots tend to fill it */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={set("website")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />

        <div>
          <label className={label}>Full name *</label>
          <input className={input} value={form.guide_name} onChange={set("guide_name")} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Phone number *</label>
            <input
              className={input}
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={form.phone_number}
              onChange={set("phone_number")}
            />
          </div>
          <div>
            <label className={label}>Email *</label>
            <input className={input} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>

        <div>
          <span className={label}>Languages you speak *</span>
          <div className="flex flex-wrap gap-2">
            {GUIDE_LANGUAGES.map((l) => {
              const on = languages.includes(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => toggleLanguage(l.code)}
                  aria-pressed={on}
                  className={`px-3 py-1.5 text-sm rounded-full border ${
                    on
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={label}>Destinations you guide at *</label>
          <input
            className={input}
            placeholder="e.g. Ganpatipule, Ratnadurg Fort, Jaigad Fort"
            value={form.destinations}
            onChange={set("destinations")}
          />
          <p className="text-xs text-gray-500 mt-1">Separate places with commas.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={label}>Base village *</label>
            <input className={input} value={form.base_village} onChange={set("base_village")} />
          </div>
          <div>
            <label className={label}>Taluka *</label>
            <input className={input} value={form.taluka_name} onChange={set("taluka_name")} />
          </div>
          <div>
            <label className={label}>District</label>
            <input className={input} value={form.district_name} onChange={set("district_name")} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Years of experience *</label>
            <input
              className={input}
              type="number"
              min="0"
              max="60"
              value={form.experience_years}
              onChange={set("experience_years")}
            />
          </div>
          <div>
            <label className={label}>Guide licence number (if any)</label>
            <input
              className={input}
              value={form.license_number}
              onChange={set("license_number")}
            />
          </div>
        </div>

        <div>
          <label className={label}>About you</label>
          <textarea
            className={input}
            rows={4}
            maxLength={1500}
            placeholder="Tell tourists a little about your experience and the tours you offer."
            value={form.about}
            onChange={set("about")}
          />
        </div>

        <div>
          <label className={label}>Your photo *</label>
          <div className="flex items-center gap-4">
            {preview ? (
              <img src={preview} alt="Preview" className="h-28 w-24 object-cover rounded border" />
            ) : (
              <div className="h-28 w-24 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center px-1">
                No photo yet
              </div>
            )}
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhoto}
                className="block text-sm"
              />
              {photo && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            A clear, front-facing photo (JPG, PNG or WebP). Maximum {MAX_PHOTO_MB} MB.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 disabled:opacity-60"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}