import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Plus,
  X,
  MapPin,
  BedDouble,
  Car,
  Bus,
  Landmark,
} from "lucide-react";
import API_BASE_URL from "../config";
import LocationPicker from "./forms/LocationPicker";
import RatnagiriLocationFields from "./RatnagiriLocationFields";

// ---------------------------------------------------------------------------
// What each tab shows
// ---------------------------------------------------------------------------

const KINDS = [
  {
    key: "locations",
    label: "Locations",
    singular: "location",
    icon: MapPin,
    nameKey: "location_name",
    columns: [
      ["location_name", "Name"],
      ["village_name", "Village"],
      ["taluka_name", "Taluka"],
      ["attraction_type", "Type"],
    ],
  },
  {
    key: "homestays",
    label: "Homestays",
    singular: "homestay",
    icon: BedDouble,
    nameKey: "homestay_name",
    columns: [
      ["homestay_name", "Name"],
      ["owner_name", "Owner"],
      ["village_town_city", "Village"],
      ["taluka_name", "Taluka"],
      ["homestay_type", "Type"],
    ],
  },
  {
    key: "drivers",
    label: "Drivers",
    singular: "driver",
    icon: Car,
    nameKey: "driver_name",
    columns: [
      ["driver_name", "Name"],
      ["vehicle_type", "Vehicle"],
      ["base_village", "Village"],
      ["taluka_name", "Taluka"],
      ["phone_number", "Phone"],
    ],
  },
  {
    key: "bus_stops",
    label: "Bus stands",
    singular: "bus stand",
    icon: Bus,
    nameKey: "stop_name",
    creatable: true,
    columns: [
      ["stop_name", "Name"],
      ["taluka_name", "Taluka"],
      ["district_name", "District"],
    ],
  },
  {
    key: "atms",
    label: "ATMs",
    singular: "ATM",
    icon: Landmark,
    nameKey: "atm_name",
    creatable: true,
    columns: [
      ["atm_name", "Name"],
      ["bank_name", "Bank"],
      ["village_name", "Village"],
      ["taluka_name", "Taluka"],
    ],
  },
];

const BANKS = [
  "State Bank of India",
  "Bank of Maharashtra",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Kotak Mahindra Bank",
  "IDBI Bank",
  "Punjab National Bank",
  "Indian Bank",
];

const BLANK_NEW = {
  bus_stops: {
    stop_name: "",
    taluka_name: "",
    village_name: "",
    district_name: "Ratnagiri",
    timetable_link: "",
    google_maps_link: "",
    latitude: "",
    longitude: "",
  },
  atms: {
    atm_name: "",
    bank_name: "",
    taluka_name: "",
    village_name: "",
    district_name: "Ratnagiri",
    address: "",
    photo_url: "",
    google_maps_link: "",
    is_24x7: true,
    has_cash_deposit: false,
    latitude: "",
    longitude: "",
  },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HIDDEN_KEYS = new Set(["id", "reviewed_by"]);
const isHiddenKey = (key) => HIDDEN_KEYS.has(key) || key.endsWith("_at");

const shortText = (v) => (v == null ? "" : String(v).split("(")[0].trim());

const prettyKey = (key) => key.replace(/_/g, " ");

function fieldType(key, value) {
  if (typeof value === "boolean") return "checkbox";
  if (Array.isArray(value)) return "list";
  if (value && typeof value === "object") return "json";
  if (/^(is|has)_/.test(key)) return "checkbox";
  if (typeof value === "string" && (value.length > 70 || value.includes("\n"))) return "textarea";
  if (/policy|description|suggestion|attractions|experiences|activities/.test(key)) return "textarea";
  return "text";
}

// Row value -> what the form control holds.
function toFormValue(key, value) {
  const type = fieldType(key, value);
  if (type === "checkbox") return !!value;
  if (type === "list") return value.join(", ");
  if (type === "json") return JSON.stringify(value, null, 2);
  return value == null ? "" : String(value);
}

const toNumberOrNull = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function api(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error("Could not reach the server.");
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    throw new Error(
      res.status === 404
        ? "The server doesn't have the admin data routes yet. Deploy the latest backend."
        : `Unexpected response from the server (HTTP ${res.status}).`
    );
  }
  if (!res.ok) throw new Error(body?.error || `Request failed (HTTP ${res.status}).`);
  return body;
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[2500] bg-black/50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function MapField({ values, onChange }) {
  return (
    <div className="sm:col-span-2">
      <label className={labelCls}>
        Location on map<span className="text-red-600"> *</span>
      </label>
      <LocationPicker
        latitude={toNumberOrNull(values.latitude)}
        longitude={toNumberOrNull(values.longitude)}
        onChange={(lat, lng) => onChange({ latitude: String(lat), longitude: String(lng) })}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Latitude">
          <input
            className={inputCls}
            value={values.latitude ?? ""}
            onChange={(e) => onChange({ latitude: e.target.value })}
          />
        </Field>
        <Field label="Longitude">
          <input
            className={inputCls}
            value={values.longitude ?? ""}
            onChange={(e) => onChange({ longitude: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add form (bus stands and ATMs)
// ---------------------------------------------------------------------------

function AddForm({ kind, values, setValues }) {
  const patch = (p) => setValues((prev) => ({ ...prev, ...p }));
  const set = (key) => (e) => patch({ [key]: e.target.value });
  const isAtm = kind === "atms";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
      {isAtm ? (
        <>
          <Field label="ATM name" required>
            <input className={inputCls} value={values.atm_name} onChange={set("atm_name")} placeholder="e.g. SBI ATM, Chiplun Market" />
          </Field>
          <Field label="Bank" required>
            <input className={inputCls} list="bank-list" value={values.bank_name} onChange={set("bank_name")} placeholder="e.g. State Bank of India" />
            <datalist id="bank-list">
              {BANKS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
        </>
      ) : (
        <div className="sm:col-span-2">
          <Field label="Bus stand name" required>
            <input className={inputCls} value={values.stop_name} onChange={set("stop_name")} placeholder="e.g. Ratnagiri Bus Stand" />
          </Field>
        </div>
      )}

      <RatnagiriLocationFields
        taluka={values.taluka_name}
        village={values.village_name}
        inputClass={inputCls}
        labelClass={labelCls}
        onChange={patch}
      />

      {isAtm && (
        <div className="sm:col-span-2">
          <Field label="Address">
            <input className={inputCls} value={values.address} onChange={set("address")} placeholder="Street, landmark" />
          </Field>
        </div>
      )}

      <MapField values={values} onChange={patch} />

      {!isAtm && (
        <div className="sm:col-span-2">
          <Field label="Timetable link" hint="Optional. A link to the bus timetable PDF.">
            <input className={inputCls} value={values.timetable_link} onChange={set("timetable_link")} placeholder="https://..." />
          </Field>
        </div>
      )}

      {isAtm && (
        <>
          <Field label="Photo URL" hint="Optional. Must start with https://">
            <input className={inputCls} value={values.photo_url} onChange={set("photo_url")} placeholder="https://..." />
          </Field>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={!!values.is_24x7} onChange={(e) => patch({ is_24x7: e.target.checked })} />
              Open 24x7
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={!!values.has_cash_deposit} onChange={(e) => patch({ has_cash_deposit: e.target.checked })} />
              Cash deposit available
            </label>
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <Field label="Google Maps link" hint="Optional. Used only if you didn't pin the map above.">
          <input className={inputCls} value={values.google_maps_link} onChange={set("google_maps_link")} placeholder="https://maps.google.com/..." />
        </Field>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit form (any record: every column of the row)
// ---------------------------------------------------------------------------

function EditForm({ row, values, setValues }) {
  const keys = useMemo(
    () => Object.keys(row).filter((k) => !isHiddenKey(k) && k !== "latitude" && k !== "longitude"),
    [row]
  );
  const hasCoords = "latitude" in row && "longitude" in row;
  const patch = (p) => setValues((prev) => ({ ...prev, ...p }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
      {hasCoords && <MapField values={values} onChange={patch} />}

      {keys.map((key) => {
        const type = fieldType(key, row[key]);
        const label = prettyKey(key);

        if (type === "checkbox") {
          return (
            <label key={key} className="inline-flex items-center gap-2 text-sm text-gray-700 capitalize sm:col-span-1">
              <input type="checkbox" checked={!!values[key]} onChange={(e) => patch({ [key]: e.target.checked })} />
              {label}
            </label>
          );
        }

        const wide = type === "textarea" || type === "json";
        return (
          <div key={key} className={wide ? "sm:col-span-2" : ""}>
            <label className={`${labelCls} capitalize`}>{label}</label>
            {wide ? (
              <textarea
                rows={type === "json" ? 5 : 3}
                className={`${inputCls} ${type === "json" ? "font-mono text-xs" : ""}`}
                value={values[key] ?? ""}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            ) : (
              <input
                className={inputCls}
                value={values[key] ?? ""}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            )}
            {type === "list" && <p className="text-[11px] text-gray-400 mt-1">Separate items with commas.</p>}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export default function AdminDataManager({ canEdit = true }) {
  const [activeKind, setActiveKind] = useState("locations");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "error" | "success", text }
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(50);
  const [editor, setEditor] = useState(null); // { mode, kind, id, row, original, values }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const kind = KINDS.find((k) => k.key === activeKind);
  const rows = data[activeKind];

  const load = useCallback(async (key) => {
    setLoading(true);
    setNotice(null);
    try {
      const list = await api(`/api/admin/data/${key}`);
      setData((prev) => ({ ...prev, [key]: Array.isArray(list) ? list : [] }));
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canEdit && data[activeKind] === undefined) load(activeKind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKind, canEdit]);

  useEffect(() => {
    setSearch("");
    setVisible(50);
    setNotice(null);
  }, [activeKind]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      kind.columns.some(([key]) => String(r[key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, search, kind]);

  if (!canEdit) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-2">Manage Data</h2>
        <p className="text-gray-500">Only admins can view and edit the live data.</p>
      </section>
    );
  }

  // ---- actions ------------------------------------------------------------

  const openEdit = (row) => {
    const values = {};
    Object.keys(row).forEach((k) => {
      if (!isHiddenKey(k)) values[k] = toFormValue(k, row[k]);
    });
    setFormError("");
    setEditor({ mode: "edit", kind: activeKind, id: row.id, row, original: values, values });
  };

  const openAdd = () => {
    setFormError("");
    setEditor({ mode: "add", kind: activeKind, values: { ...BLANK_NEW[activeKind] } });
  };

  const setEditorValues = (updater) =>
    setEditor((prev) => ({
      ...prev,
      values: typeof updater === "function" ? updater(prev.values) : updater,
    }));

  const save = async () => {
    setFormError("");

    if (editor.mode === "add") {
      const v = editor.values;
      const nameKey = kind.nameKey;
      if (!String(v[nameKey] || "").trim()) {
        setFormError(`${prettyKey(nameKey)} is required.`);
        return;
      }
      if (editor.kind === "atms" && !String(v.bank_name || "").trim()) {
        setFormError("Bank is required.");
        return;
      }
      const hasPin = toNumberOrNull(v.latitude) !== null && toNumberOrNull(v.longitude) !== null;
      if (!hasPin && !String(v.google_maps_link || "").trim()) {
        setFormError("Pin the location on the map (or paste a Google Maps link).");
        return;
      }

      const body = { ...v };
      body.latitude = toNumberOrNull(v.latitude);
      body.longitude = toNumberOrNull(v.longitude);

      setSaving(true);
      try {
        const created = await api(`/api/admin/data/${editor.kind}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        setData((prev) => ({ ...prev, [editor.kind]: [created, ...(prev[editor.kind] || [])] }));
        setNotice({ type: "success", text: `${kind.singular[0].toUpperCase()}${kind.singular.slice(1)} added.` });
        setEditor(null);
      } catch (err) {
        setFormError(err.message);
      } finally {
        setSaving(false);
      }
      return;
    }

    // Edit: send only what changed.
    const changes = {};
    Object.keys(editor.values).forEach((k) => {
      if (editor.values[k] !== editor.original[k]) changes[k] = editor.values[k];
    });
    if (Object.keys(changes).length === 0) {
      setEditor(null);
      return;
    }

    setSaving(true);
    try {
      const updated = await api(`/api/admin/data/${editor.kind}/${editor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      setData((prev) => ({
        ...prev,
        [editor.kind]: (prev[editor.kind] || []).map((r) => (r.id === editor.id ? updated : r)),
      }));
      setNotice({ type: "success", text: "Changes saved." });
      setEditor(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const name = row[kind.nameKey] || `#${row.id}`;
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeletingId(row.id);
    setNotice(null);
    try {
      await api(`/api/admin/data/${activeKind}/${row.id}`, { method: "DELETE" });
      setData((prev) => ({
        ...prev,
        [activeKind]: (prev[activeKind] || []).filter((r) => r.id !== row.id),
      }));
      setNotice({ type: "success", text: `Deleted "${name}".` });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  // ---- render -------------------------------------------------------------

  const shown = filtered.slice(0, visible);

  return (
    <section>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="text-xl font-semibold">Manage Data</h2>
          <p className="text-gray-500 text-sm mt-1">
            View, edit and delete everything that is live on the site. Add bus stands and ATMs here too.
          </p>
        </div>
      </div>

      {/* Kind tabs */}
      <div className="flex flex-wrap gap-2 mb-5" role="tablist">
        {KINDS.map((k) => {
          const Icon = k.icon;
          const active = k.key === activeKind;
          const count = data[k.key]?.length;
          return (
            <button
              key={k.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveKind(k.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                active
                  ? "bg-[#0c2a2e] text-white border-[#0c2a2e]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-teal-500"
              }`}
            >
              <Icon size={16} />
              {k.label}
              {count !== undefined && (
                <span className={`text-xs px-1.5 rounded-full ${active ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisible(50);
            }}
            placeholder={`Search ${kind.label.toLowerCase()}...`}
            aria-label={`Search ${kind.label}`}
            className={`${inputCls} pl-9`}
          />
        </div>
        <button
          onClick={() => load(activeKind)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        {kind.creatable && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            <Plus size={16} /> Add {kind.singular}
          </button>
        )}
      </div>

      {notice && (
        <div
          role="status"
          className={`mb-4 rounded-md border px-3 py-2 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* List */}
      {loading && rows === undefined ? (
        <p className="text-gray-500">Loading {kind.label.toLowerCase()}...</p>
      ) : rows === undefined ? null : filtered.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center text-gray-500">
          {rows.length === 0
            ? `No ${kind.label.toLowerCase()} yet.`
            : `Nothing matches "${search}".`}
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold w-14">ID</th>
                {kind.columns.map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-semibold">{label}</th>
                ))}
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{row.id}</td>
                  {kind.columns.map(([key], i) => (
                    <td key={key} className={`px-4 py-3 ${i === 0 ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                      {key === "homestay_type" || key === "attraction_type"
                        ? shortText(row[key]) || "-"
                        : row[key] || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-600"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => remove(row)}
                        disabled={deletingId === row.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-60"
                      >
                        <Trash2 size={13} /> {deletingId === row.id ? "Deleting" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing {shown.length} of {filtered.length}
            </span>
            {filtered.length > shown.length && (
              <button
                onClick={() => setVisible((v) => v + 50)}
                className="font-semibold text-teal-700 hover:underline"
              >
                Show more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit / add modal */}
      {editor && (
        <Modal
          title={
            editor.mode === "add"
              ? `Add ${kind.singular}`
              : `Edit ${kind.singular}: ${editor.row[kind.nameKey] || `#${editor.id}`}`
          }
          onClose={() => !saving && setEditor(null)}
        >
          {formError && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </div>
          )}

          {editor.mode === "add" ? (
            <AddForm kind={editor.kind} values={editor.values} setValues={setEditorValues} />
          ) : (
            <EditForm row={editor.row} values={editor.values} setValues={setEditorValues} />
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditor(null)}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : editor.mode === "add" ? `Add ${kind.singular}` : "Save changes"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}