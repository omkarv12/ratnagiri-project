import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Home,
  Car,
  Bus,
  Leaf,
  BookOpen,
  CalendarDays,
  Landmark,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import API_BASE_URL from "../config";

/* ------------------------------------------------------------------
   Admin analytics — one API call (/api/admin/analytics), pure SVG/CSS
   charts (no chart library needed).

   Props
     onNavigate(tabKey)  optional — lets "Needs attention" items jump to
                         the matching admin tab.
------------------------------------------------------------------ */

const PALETTE = [
  "#0f766e", "#f97316", "#6366f1", "#e11d48",
  "#0ea5e9", "#eab308", "#84cc16", "#a855f7",
];
const TEAL = "#0f766e";
const ORANGE = "#f97316";

const EVENT_COLORS = {
  beaches: "#f7a072",
  forts: "#64b5f6",
  temples: "#ba68c8",
  waterfalls: "#4dd0e1",
  mangoes: "#ffd54f",
};

const num = (v) => Number(v) || 0;
const pct = (part, total) => (total > 0 ? Math.round((num(part) / num(total)) * 100) : 0);
const cap = (s) => String(s || "").replace(/^./, (c) => c.toUpperCase());

/* ----------------------------- primitives ----------------------------- */

function Card({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function Empty({ text = "No data yet" }) {
  return <p className="text-sm text-gray-400 py-6 text-center">{text}</p>;
}

function StatCard({ icon: Icon, label, value, sub, accent, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-left ${
        onClick ? "hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer" : ""
      }`}
    >
      <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon size={20} />
        </span>
      </div>
      {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
    </Tag>
  );
}

function Donut({ data, colors = PALETTE, centerLabel = "Total", size = 150 }) {
  const items = (data || []).filter((d) => num(d.value) > 0);
  const total = items.reduce((s, d) => s + num(d.value), 0);
  if (total === 0) return <Empty />;

  const thickness = 24;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {items.map((d, i) => {
            const len = (num(d.value) / total) * c;
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-[11px] text-gray-500">{centerLabel}</span>
        </div>
      </div>

      <ul className="space-y-1.5 text-sm min-w-0 flex-1">
        {items.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="truncate text-gray-700">{d.label}</span>
            <span className="ml-auto pl-2 font-semibold text-gray-900">
              {d.value} <span className="font-normal text-gray-400">({pct(d.value, total)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HBars({ data, color = TEAL, colorFor }) {
  const items = data || [];
  const max = Math.max(1, ...items.map((d) => num(d.value)));
  if (items.length === 0) return <Empty />;
  return (
    <ul className="space-y-3">
      {items.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="truncate pr-2 text-gray-700">{d.label}</span>
            <span className="font-semibold text-gray-900">{d.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{
                width: `${(num(d.value) / max) * 100}%`,
                background: colorFor ? colorFor(d, i) : color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ColumnChart({ data, color = TEAL }) {
  const items = data || [];
  const max = Math.max(1, ...items.map((d) => num(d.value)));
  if (items.length === 0) return <Empty />;
  return (
    <div className="flex items-end justify-between gap-3 h-44 pt-4">
      {items.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end h-full">
          <span className="text-xs font-semibold text-gray-700 mb-1">{d.value}</span>
          <div
            className="w-full max-w-[44px] rounded-t-md transition-all"
            style={{
              height: `${Math.max((num(d.value) / max) * 100, num(d.value) > 0 ? 6 : 2)}%`,
              background: num(d.value) > 0 ? color : "#e5e7eb",
            }}
          />
          <span className="text-[11px] text-gray-500 mt-2">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Progress({ label, part, total, hint }) {
  const p = pct(part, total);
  const color = p >= 75 ? "#16a34a" : p >= 40 ? "#f59e0b" : "#dc2626";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">
          {num(part)}/{num(total)} <span className="font-normal text-gray-400">· {p}%</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${p}%`, background: color }} />
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ------------------------------- main -------------------------------- */

export default function AnalyticsDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load analytics");
      setData(json);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Merge taluka numbers so locations & homestays can be compared side by side
  const talukaRows = useMemo(() => {
    if (!data) return [];
    const map = {};
    (data.locations_by_taluka || []).forEach((r) => {
      map[r.label] = { label: r.label, locations: num(r.value), homestays: 0 };
    });
    (data.homestays_by_taluka || []).forEach((r) => {
      map[r.label] = map[r.label] || { label: r.label, locations: 0, homestays: 0 };
      map[r.label].homestays = num(r.value);
    });
    return Object.values(map).sort(
      (a, b) => b.locations + b.homestays - (a.locations + a.homestays)
    );
  }, [data]);

  // Auto-generated "what needs attention" list
  const insights = useMemo(() => {
    if (!data) return [];
    const out = [];
    const p = data.pending || {};
    const t = data.totals || {};
    const lr = data.location_readiness || {};
    const st = data.stories || {};

    const waiting = num(p.locations) + num(p.homestays);
    if (waiting > 0)
      out.push({
        level: "warn",
        text: `${waiting} submission${waiting > 1 ? "s" : ""} waiting for review (${num(p.locations)} locations, ${num(p.homestays)} homestays).`,
        action: "Review now",
        tab: "pendingSubmissions",
      });

    if (num(p.events) > 0)
      out.push({
        level: "warn",
        text: `${num(p.events)} event contribution${num(p.events) > 1 ? "s" : ""} waiting for approval.`,
        action: "Review events",
        tab: "events",
      });

    const gaps = talukaRows.filter((r) => r.locations > 0 && r.homestays === 0 && r.label !== "Unknown");
    if (gaps.length > 0)
      out.push({
        level: "info",
        text: `No homestays listed in ${gaps.slice(0, 4).map((g) => g.label).join(", ")}${
          gaps.length > 4 ? ` and ${gaps.length - 4} more` : ""
        }, though tourist attractions exist there. Good places to recruit hosts.`,
      });

    const noPhotos = num(lr.total) - num(lr.with_photos);
    if (num(lr.total) > 0 && noPhotos > 0)
      out.push({
        level: pct(lr.with_photos, lr.total) < 60 ? "warn" : "info",
        text: `${noPhotos} of ${num(lr.total)} locations have no photos.`,
      });

    const noCoords = num(lr.total) - num(lr.with_coordinates);
    if (num(lr.total) > 0 && noCoords > 0)
      out.push({
        level: "warn",
        text: `${noCoords} location${noCoords > 1 ? "s" : ""} missing coordinates, so they won't show on the map.`,
      });

    if (num(st.drafts) > 0)
      out.push({
        level: "info",
        text: `${num(st.drafts)} stor${num(st.drafts) > 1 ? "ies are" : "y is"} still in draft.`,
        action: "Open stories",
        tab: "addEditItineraries",
      });

    const thisMonth = (data.events_by_month || [])[0];
    if (thisMonth && num(thisMonth.value) === 0 && num(t.events_approved) >= 0)
      out.push({
        level: "info",
        text: `No approved events scheduled for ${thisMonth.label}. The public calendar will look empty.`,
        action: "Manage events",
        tab: "events",
      });

    return out;
  }, [data, talukaRows]);

  if (loading && !data) {
    return (
      <section className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-200" />
      </section>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
        <p className="text-red-600 font-semibold mb-1">Couldn't load analytics</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          Try again
        </button>
      </div>
    );
  }

  const t = data.totals || {};
  const p = data.pending || {};
  const lr = data.location_readiness || {};
  const hr = data.homestay_readiness || {};
  const st = data.stories || {};
  const go = (tab) => (onNavigate ? () => onNavigate(tab) : undefined);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-sm text-gray-500">
            Where tourism content stands, and what needs your attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="text-xs text-gray-400">
              Updated {updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Needs attention */}
      <Card title="Needs your attention" subtitle="Generated automatically from the latest data">
        {insights.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 size={18} /> Everything looks good. Nothing needs action right now.
          </div>
        ) : (
          <ul className="space-y-2">
            {insights.map((i, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  i.level === "warn" ? "bg-amber-50 text-amber-900" : "bg-sky-50 text-sky-900"
                }`}
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span className="flex-1">{i.text}</span>
                {i.tab && onNavigate && (
                  <button
                    onClick={() => onNavigate(i.tab)}
                    className="flex shrink-0 items-center gap-1 font-semibold underline-offset-2 hover:underline"
                  >
                    {i.action} <ArrowRight size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Locations" value={num(t.locations)} accent="#0f766e"
          sub={num(p.locations) ? `${num(p.locations)} pending review` : "None pending"}
          onClick={go("pendingSubmissions")} />
        <StatCard icon={Home} label="Homestays" value={num(t.homestays)} accent="#f97316"
          sub={num(p.homestays) ? `${num(p.homestays)} pending review` : "None pending"}
          onClick={go("pendingSubmissions")} />
        <StatCard icon={CalendarDays} label="Events (approved)" value={num(t.events_approved)} accent="#6366f1"
          sub={num(p.events) ? `${num(p.events)} awaiting approval` : "None pending"}
          onClick={go("events")} />
        <StatCard icon={BookOpen} label="Stories published" value={num(t.stories_published)} accent="#e11d48"
          sub={`${num(st.total_views)} total views · ${num(st.comments)} comments`}
          onClick={go("addEditItineraries")} />
        <StatCard icon={Car} label="Drivers" value={num(t.drivers)} accent="#0ea5e9"
          sub={num(p.drivers) ? `${num(p.drivers)} pending` : "Registered drivers"} />
        <StatCard icon={Bus} label="Bus stops" value={num(t.bus_stops)} accent="#eab308" sub="Mapped stops" />
        <StatCard icon={Leaf} label="Eco & water" value={num(t.eco_water)} accent="#84cc16" sub="Eco / water points" />
        <StatCard icon={Landmark} label="Village profiles" value={num(t.village_profiles)} accent="#a855f7"
          sub="Curated village pages" onClick={go("villageProfiles")} />
      </div>

      {/* Coverage by taluka */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Coverage by taluka"
          subtitle="Attractions vs homestays. Gaps show where to add listings."
        >
          {talukaRows.length === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="flex gap-4 text-xs mb-3">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TEAL }} />Locations</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ORANGE }} />Homestays</span>
              </div>
              <ul className="space-y-3">
                {(() => {
                  const max = Math.max(1, ...talukaRows.map((r) => Math.max(r.locations, r.homestays)));
                  return talukaRows.map((r) => (
                    <li key={r.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{r.label}</span>
                        <span className="text-xs text-gray-500">
                          {r.locations} locations · {r.homestays} homestays
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full" style={{ width: `${(r.locations / max) * 100}%`, background: TEAL }} />
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full" style={{ width: `${(r.homestays / max) * 100}%`, background: ORANGE }} />
                        </div>
                      </div>
                    </li>
                  ));
                })()}
              </ul>
            </>
          )}
        </Card>

        <Card title="Attractions by type" subtitle="What kind of places we list">
          <Donut data={data.locations_by_type} centerLabel="locations" />
        </Card>
      </div>

      {/* Homestays + roads */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Homestays by type" subtitle="Mix of accommodation on offer">
          <HBars data={data.homestays_by_type} color={ORANGE} />
        </Card>
        <Card title="Road condition to attractions" subtitle="Accessibility of listed locations">
          <Donut
            data={data.road_condition}
            centerLabel="locations"
            colors={["#16a34a", "#eab308", "#f97316", "#dc2626", "#94a3b8", "#6366f1"]}
          />
        </Card>
      </div>

      {/* Readiness */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Location data quality" subtitle="Complete listings convert better. Aim for 75%+.">
          <div className="space-y-4">
            <Progress label="Have photos" part={lr.with_photos} total={lr.total} />
            <Progress label="Have map coordinates" part={lr.with_coordinates} total={lr.total} />
            <Progress label="Have signboards on the way" part={lr.with_signboards} total={lr.total} />
          </div>
        </Card>
        <Card title="Homestay readiness" subtitle="How ready hosts are for tourists">
          <div className="space-y-4">
            <Progress label="Registered with MTDC" part={hr.mtdc_registered} total={hr.total} />
            <Progress label="Accept digital payments" part={hr.digital_payments} total={hr.total} />
            <Progress label="Listed on an online booking platform" part={hr.listed_online} total={hr.total} />
          </div>
        </Card>
      </div>

      {/* Events + stories */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Events, next 6 months" subtitle="Approved events per month" className="lg:col-span-1">
          <ColumnChart data={data.events_by_month} color="#6366f1" />
        </Card>
        <Card title="Events by category" subtitle="Approved events" className="lg:col-span-1">
          <HBars
            data={(data.events_by_category || []).map((d) => ({ ...d, label: cap(d.label) }))}
            colorFor={(d) => EVENT_COLORS[String(d.label).toLowerCase()] || TEAL}
          />
        </Card>
        <Card title="Top stories" subtitle="By views" className="lg:col-span-1">
          <HBars data={st.top} color="#e11d48" />
        </Card>
      </div>
    </section>
  );
}