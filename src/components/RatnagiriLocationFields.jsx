import { useEffect, useState } from "react";
import villagesByTaluka from "../data/ratnagiriVillages.json";

const DISTRICT = "Ratnagiri";
const OTHER = "__other__";
const TALUKAS = Object.keys(villagesByTaluka);

/**
 * District (fixed to Ratnagiri) -> Taluka -> Village, all from a local JSON file,
 * so there is no request that can fail ("Could not load the village list").
 *
 * Props
 *   taluka, village : current values from your form state
 *   onChange(patch) : called with e.g. { district_name, taluka_name, village_name } - merge into your state:
 *                     onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
 *   talukaKey / villageKey : the field names your form state and backend use.
 *                     Defaults: "taluka_name" / "village_name".
 *                     Driver form uses villageKey="base_village".
 *   inputClass / labelClass : optional, to match your form styling
 */
export default function RatnagiriLocationFields({
  taluka,
  village,
  onChange,
  talukaKey = "taluka_name",
  villageKey = "village_name",
  inputClass = "w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-500",
  labelClass = "block text-sm font-semibold text-slate-700 mb-1",
}) {
  // True when the visitor chose "Other" and types the village name themselves.
  const [useOther, setUseOther] = useState(false);

  // Make sure the district is always part of the submitted data.
  useEffect(() => {
    onChange({ district_name: DISTRICT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const villages = taluka ? villagesByTaluka[taluka] || [] : [];
  const selectValue = useOther ? OTHER : village || "";

  const handleTaluka = (e) => {
    setUseOther(false);
    onChange({ district_name: DISTRICT, [talukaKey]: e.target.value, [villageKey]: "" });
  };

  const handleVillage = (e) => {
    const value = e.target.value;
    if (value === OTHER) {
      setUseOther(true);
      onChange({ [villageKey]: "" });
    } else {
      setUseOther(false);
      onChange({ [villageKey]: value });
    }
  };

  return (
    <>
      <div>
        <label htmlFor="rt-district" className={labelClass}>
          District <span className="text-red-600">*</span>
        </label>
        <select id="rt-district" value={DISTRICT} disabled className={inputClass}>
          <option value={DISTRICT}>{DISTRICT}</option>
        </select>
      </div>

      <div>
        <label htmlFor="rt-taluka" className={labelClass}>
          Taluka <span className="text-red-600">*</span>
        </label>
        <select
          id="rt-taluka"
          value={taluka || ""}
          onChange={handleTaluka}
          required
          className={inputClass}
        >
          <option value="">Select Taluka</option>
          {TALUKAS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="rt-village" className={labelClass}>
          Village Name <span className="text-red-600">*</span>
        </label>
        <select
          id="rt-village"
          value={selectValue}
          onChange={handleVillage}
          disabled={!taluka}
          required={!useOther}
          className={inputClass}
        >
          <option value="">{taluka ? "Select Village" : "Select taluka first"}</option>
          {villages.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
          {taluka && <option value={OTHER}>Other (type village name)</option>}
        </select>

        {useOther && (
          <input
            type="text"
            autoFocus
            required
            value={village || ""}
            onChange={(e) => onChange({ [villageKey]: e.target.value })}
            placeholder="Type the village name"
            className={`${inputClass} mt-2`}
          />
        )}
      </div>
    </>
  );
}
