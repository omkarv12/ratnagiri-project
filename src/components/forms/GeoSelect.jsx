import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config";

const inputCls =
    "w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";
const Req = () => <span className="text-red-600 font-semibold"> *</span>;

const NOT_LISTED = "__not_listed__";
const unique = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));

// Loaded once per page visit and shared by every form that uses GeoSelect.
let geoCache = null;

/*
  District -> Taluka -> Village linked dropdowns, fed by GET /api/info.

  Props
    district, taluka, village   current values (strings)
    onChange(patch)             patch is an object such as
                                { taluka_name: "Dapoli", village_name: "" }
  Field names match the existing form data, so the payload is unchanged.
*/
export default function GeoSelect({ district, taluka, village, onChange }) {
    const [rows, setRows] = useState(geoCache || []);
    const [status, setStatus] = useState(geoCache ? "ready" : "loading");
    const [custom, setCustom] = useState(false);

    useEffect(() => {
        if (geoCache) return;
        fetch(`${API_BASE_URL}/api/info`)
            .then((r) => r.json())
            .then((data) => {
                geoCache = Array.isArray(data) ? data : [];
                setRows(geoCache);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, []);

    const districts = useMemo(() => unique(rows.map((r) => r.district)), [rows]);
    const talukas = useMemo(
        () => unique(rows.filter((r) => r.district === district).map((r) => r.taluka)),
        [rows, district]
    );
    const villages = useMemo(
        () =>
            unique(
                rows
                    .filter((r) => r.district === district && r.taluka === taluka)
                    .map((r) => r.village)
            ),
        [rows, district, taluka]
    );

    // A restored draft may hold a village that is not in the list.
    const isCustom = custom || (status === "ready" && village && !villages.includes(village));

    return (
        <>
            <div>
                <label className={labelCls}>District<Req /></label>
                <select
                    value={district}
                    onChange={(e) => {
                        setCustom(false);
                        onChange({ district_name: e.target.value, taluka_name: "", village_name: "" });
                    }}
                    className={inputCls}
                    required
                >
                    <option value="">{status === "loading" ? "Loading..." : "Select District"}</option>
                    {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelCls}>Taluka<Req /></label>
                <select
                    value={taluka}
                    disabled={!district}
                    onChange={(e) => {
                        setCustom(false);
                        onChange({ taluka_name: e.target.value, village_name: "" });
                    }}
                    className={inputCls}
                    required
                >
                    <option value="">Select Taluka</option>
                    {talukas.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelCls}>Village Name<Req /></label>
                <select
                    value={isCustom ? NOT_LISTED : village}
                    disabled={!taluka}
                    onChange={(e) => {
                        if (e.target.value === NOT_LISTED) {
                            setCustom(true);
                            onChange({ village_name: "" });
                        } else {
                            setCustom(false);
                            onChange({ village_name: e.target.value });
                        }
                    }}
                    className={inputCls}
                    required
                >
                    <option value="">{taluka ? "Select Village" : "Select taluka first"}</option>
                    {villages.map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                    <option value={NOT_LISTED}>My village is not listed</option>
                </select>

                {isCustom && (
                    <input
                        type="text"
                        value={village}
                        onChange={(e) => onChange({ village_name: e.target.value })}
                        placeholder="Type the village name"
                        className={`${inputCls} mt-2`}
                        required
                    />
                )}

                {status === "error" && (
                    <p className="text-[11px] text-red-600 mt-1">
                        Could not load the village list. Please refresh the page.
                    </p>
                )}
            </div>
        </>
    );
}
