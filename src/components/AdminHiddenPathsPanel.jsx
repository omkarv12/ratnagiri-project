import { useCallback, useEffect, useState } from 'react';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import API_BASE_URL from '../config';

const { MapContainer, TileLayer, Marker, Polyline, useMap } = ReactLeaflet;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'needs_changes', label: 'Needs changes' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE = {
  pending: { label: 'Pending review', cls: 'bg-amber-100 text-amber-800' },
  needs_changes: { label: 'Needs changes', cls: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
};

const CHECKLIST = [
  'Location and route checked on the map',
  'Photos look genuine and match the place',
  'Safety information is present and sensible',
  'Not on private, protected or restricted land',
];

const PATH_TYPES = ['Forest trail', 'Secret beach', 'Waterfall', 'Viewpoint', 'Village walk'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard'];

const EDIT_FIELDS = [
  { key: 'title', label: 'Title', full: true },
  { key: 'taluka', label: 'Taluka' },
  { key: 'village', label: 'Village' },
  { key: 'best_season', label: 'Best season' },
  { key: 'avoid_season', label: 'Avoid' },
  { key: 'how_to_reach', label: 'How to reach', full: true, textarea: true },
  { key: 'safety_notes', label: 'Safety notes', full: true, textarea: true },
];

const inputCls = 'border rounded px-2 py-1 w-full text-sm';
const cardCls = 'bg-white rounded-lg shadow p-4';

const pin = (text, bg) =>
  L.divIcon({
    html: `<div style="width:26px;height:26px;border-radius:50%;background:${bg};color:#fff;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font:700 11px sans-serif;">${text}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
const START_ICON = pin('S', '#2d6a3e');
const END_ICON = pin('E', '#16301f');

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function FitRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (route.length > 0) map.fitBounds(L.latLngBounds(route), { padding: [30, 30], animate: false });
  }, [route, map]);
  return null;
}

function ReviewMap({ route }) {
  if (!route || route.length < 2) {
    return <div className="h-64 grid place-items-center text-sm text-gray-400 bg-gray-100">No route drawn.</div>;
  }
  const start = route[0];
  const end = route[route.length - 1];
  return (
    <div className="relative isolate h-64">
      <MapContainer center={start} zoom={13} className="w-full h-full z-0">
        <FitRoute route={route} />
        <TileLayer
          url={`https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_KEY}`}
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={20}
        />
        <Polyline positions={route} pathOptions={{ color: '#c98a2b', weight: 5, opacity: 0.95 }} />
        <Marker position={start} icon={START_ICON} />
        <Marker position={end} icon={END_ICON} />
      </MapContainer>
    </div>
  );
}

function Fact({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-line">{children || '—'}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export default function AdminHiddenPathsPanel({ canEdit, onPendingCountChange }) {
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Review form for the selected submission
  const [checklist, setChecklist] = useState(CHECKLIST.map(() => false));
  const [options, setOptions] = useState({ verified_by_dept: false, locals_pick: false, hide_exact_coords: false });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const selected = items.find((i) => i.id === selectedId) || null;

  const load = useCallback(async (s) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hidden-paths?status=${s}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not load submissions.');
      setItems(data.paths);
      setCounts(data.counts || {});
      onPendingCountChange?.(data.counts?.pending || 0);
      setSelectedId((cur) => (data.paths.some((p) => p.id === cur) ? cur : data.paths[0]?.id ?? null));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(status); }, [status, load]);

  // Reset the review form whenever a different submission is opened.
  useEffect(() => {
    if (!selected) return;
    setChecklist(CHECKLIST.map(() => false));
    setOptions({
      verified_by_dept: !!selected.verified_by_dept,
      locals_pick: !!selected.locals_pick,
      hide_exact_coords: !!selected.hide_exact_coords,
    });
    setNote(selected.admin_note || '');
    setEditForm(null);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const review = async (action) => {
    if (action !== 'approve' && !note.trim()) {
      setError('Add a note to the submitter. It is required when you reject or ask for changes.');
      return;
    }
    if (action === 'approve' && !checklist.every(Boolean)) {
      setError('Tick every item in the review checklist before approving.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hidden-paths/${selected.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note: note.trim(),
          checklist_complete: checklist.every(Boolean),
          ...options,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      alert(data.message);
      await load(status);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hidden-paths/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed.');
      setItems((prev) => prev.map((p) => (p.id === data.path.id ? data.path : p)));
      setEditForm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const deletePath = async () => {
    if (!window.confirm('Delete this path permanently? This can\'t be undone.')) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hidden-paths/${selected.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed.');
      await load(status);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () =>
    setEditForm({
      title: selected.title || '',
      path_type: selected.path_type,
      difficulty: selected.difficulty,
      taluka: selected.taluka || '',
      village: selected.village || '',
      best_season: selected.best_season || '',
      avoid_season: selected.avoid_season || '',
      open_in_monsoon: !!selected.open_in_monsoon,
      how_to_reach: selected.how_to_reach || '',
      safety_notes: selected.safety_notes || '',
    });

  // ---- Render ----------------------------------------------------------------

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Hidden Paths</h2>
        <p className="text-gray-500 text-sm mt-1">
          Review paths shared by the public. Only approved paths appear on the Hidden Paths page.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setStatus(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              status === t.id
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
            }`}
          >
            {t.label}
            {counts[t.id] > 0 && <span className="ml-1.5 text-xs opacity-80">({counts[t.id]})</span>}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No {STATUS_TABS.find((t) => t.id === status)?.label.toLowerCase()} paths.</p>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
          {/* QUEUE */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {items.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 border-l-4 transition-colors ${
                  p.id === selectedId ? 'bg-green-50 border-l-green-700' : 'border-l-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-800">{p.title}</span>
                  {p.status === 'pending' && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">New</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{[p.village, p.taluka].filter(Boolean).join(', ')}</p>
                <p className="text-xs text-gray-400">{p.submitter_role || 'Unknown'} · {formatDate(p.created_at)}</p>
              </button>
            ))}
          </div>

          {/* DETAIL */}
          {selected && (
            <div className="space-y-5 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Reviewing submission</p>
                  <h3 className="text-2xl font-bold text-gray-900">{selected.title}</h3>
                  <p className="text-sm text-gray-500">
                    {[selected.village, selected.taluka].filter(Boolean).join(', ')} · {selected.path_type} · {selected.difficulty}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_BADGE[selected.status]?.cls}`}>
                  {STATUS_BADGE[selected.status]?.label}
                </span>
              </div>

              <div className="grid xl:grid-cols-[1fr_320px] gap-5 items-start">
                {/* LEFT: what was submitted */}
                <div className="space-y-5 min-w-0">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ReviewMap route={selected.route} />
                    <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-2.5 text-sm border-t">
                      <span><strong>Length</strong> {selected.length_km ?? '–'} km</span>
                      <span><strong>Time</strong> ~{selected.duration_min ? Math.round(selected.duration_min / 6) / 10 : '–'} hr</span>
                      <span><strong>Points</strong> {selected.route?.length || 0}</span>
                    </div>
                  </div>

                  {selected.photos?.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {selected.photos.map((src, i) => (
                        <a key={src} href={src} target="_blank" rel="noreferrer" className="relative block">
                          <img src={src} alt="" className="w-full h-28 object-cover rounded-lg border" />
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-white/90 rounded px-1.5 py-0.5">
                            {i === 0 ? 'Cover photo' : `Photo ${i + 1}`}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className={cardCls}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Path details</h4>
                      {canEdit && !editForm && (
                        <div className="flex gap-3 text-sm">
                          <button onClick={startEdit} className="text-yellow-700 font-semibold hover:underline">Edit</button>
                          <button onClick={deletePath} disabled={busy} className="text-red-600 font-semibold hover:underline">Delete</button>
                        </div>
                      )}
                    </div>

                    {editForm ? (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Type</label>
                            <select
                              value={editForm.path_type}
                              onChange={(e) => setEditForm({ ...editForm, path_type: e.target.value })}
                              className={inputCls}
                            >
                              {PATH_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Difficulty</label>
                            <select
                              value={editForm.difficulty}
                              onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                              className={inputCls}
                            >
                              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                            </select>
                          </div>
                          {EDIT_FIELDS.map((f) => (
                            <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                              <label className="block text-xs font-semibold mb-1">{f.label}</label>
                              {f.textarea ? (
                                <textarea
                                  rows="3"
                                  value={editForm[f.key]}
                                  onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                  className={inputCls}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editForm[f.key]}
                                  onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                  className={inputCls}
                                />
                              )}
                            </div>
                          ))}
                          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editForm.open_in_monsoon}
                              onChange={(e) => setEditForm({ ...editForm, open_in_monsoon: e.target.checked })}
                            />
                            Open in monsoon
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={saveEdit} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-60">
                            Save
                          </button>
                          <button onClick={() => setEditForm(null)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Fact label="Best season">{selected.best_season}</Fact>
                          <Fact label="Avoid">{selected.avoid_season}</Fact>
                        </div>
                        <Fact label="How to reach">{selected.how_to_reach}</Fact>
                        <div className="bg-amber-50 rounded-lg px-3 py-2.5">
                          <p className="text-[10px] font-bold tracking-wider text-amber-900 uppercase">Safety notes from submitter</p>
                          <p className="text-sm text-amber-950 whitespace-pre-line">{selected.safety_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: submitter + review */}
                <div className="space-y-5">
                  <div className={cardCls}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Submitted by</h4>
                      <span className="text-[10px] font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">ADMIN ONLY</span>
                    </div>
                    <p className="text-sm font-semibold">{selected.submitter_name || '—'}</p>
                    <p className="text-xs text-gray-500 mb-2">{selected.submitter_role}</p>
                    {selected.submitter_phone && (
                      <p className="text-sm"><a href={`tel:${selected.submitter_phone}`} className="text-blue-600 hover:underline">{selected.submitter_phone}</a></p>
                    )}
                    {selected.submitter_email && (
                      <p className="text-sm break-all"><a href={`mailto:${selected.submitter_email}`} className="text-blue-600 hover:underline">{selected.submitter_email}</a></p>
                    )}
                    {selected.submitter_note && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded px-2.5 py-2 mt-3 whitespace-pre-line">
                        <strong>Note:</strong> {selected.submitter_note}
                      </p>
                    )}
                  </div>

                  {canEdit ? (
                    <>
                      <div className={cardCls}>
                        <h4 className="font-semibold mb-3">Review checklist</h4>
                        <div className="space-y-2.5">
                          {CHECKLIST.map((label, i) => (
                            <label key={label} className="flex items-start gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={checklist[i]}
                                onChange={(e) => setChecklist((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className={cardCls}>
                        <h4 className="font-semibold mb-3">Publishing options</h4>
                        <div className="space-y-2.5">
                          {[
                            { key: 'hide_exact_coords', label: 'Hide exact coordinates. Show only the nearest village.' },
                            { key: 'verified_by_dept', label: 'Show the "Verified by department" badge (only if visited)' },
                            { key: 'locals_pick', label: 'Mark as "Locals\' pick"' },
                          ].map((o) => (
                            <label key={o.key} className="flex items-start gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={options[o.key]}
                                onChange={(e) => setOptions((prev) => ({ ...prev, [o.key]: e.target.checked }))}
                              />
                              {o.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className={cardCls}>
                        <h4 className="font-semibold mb-2">Note to submitter</h4>
                        <textarea
                          rows="3"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Required if you reject or ask for changes. Optional if you approve."
                          className={inputCls}
                        />
                        <div className="space-y-2 mt-3">
                          <button
                            onClick={() => review('approve')}
                            disabled={busy}
                            className="w-full py-2.5 rounded-lg bg-[#1f3d2b] text-white text-sm font-bold hover:bg-[#16301f] disabled:opacity-60"
                          >
                            {selected.status === 'approved' ? 'Save and keep published' : 'Approve and publish'}
                          </button>
                          <button
                            onClick={() => review('request_changes')}
                            disabled={busy}
                            className="w-full py-2.5 rounded-lg border border-[#1f3d2b] text-[#1f3d2b] text-sm font-bold hover:bg-green-50 disabled:opacity-60"
                          >
                            {selected.status === 'approved' ? 'Unpublish and request changes' : 'Request changes'}
                          </button>
                          <button
                            onClick={() => review('reject')}
                            disabled={busy}
                            className="w-full py-2.5 rounded-lg border border-red-300 text-red-700 text-sm font-bold hover:bg-red-50 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 bg-white rounded-lg shadow p-4">View only. Only admins can review paths.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
