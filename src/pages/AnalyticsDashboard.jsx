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
  Download,
  Loader2,
  ArrowUpDown,
  Gauge,
  Eye,
  MessageSquare,
  Inbox,
} from "lucide-react";
import API_BASE_URL from "../config";

/* ------------------------------------------------------------------
   Admin analytics: one API call (/api/admin/analytics), pure SVG/CSS
   charts, plus a "Download PDF" report.

   PDF export needs two packages (loaded lazily, only when clicked):
       npm install jspdf jspdf-autotable

   Props
     onNavigate(tabKey)  optional, lets "Needs attention" items jump to
                         the matching admin tab.
------------------------------------------------------------------ */

const PALETTE = [
  "#0f766e", "#f97316", "#6366f1", "#e11d48",
  "#0ea5e9", "#eab308", "#84cc16", "#a855f7",
];
const ROAD_COLORS = ["#16a34a", "#eab308", "#f97316", "#dc2626", "#94a3b8", "#6366f1"];
const TEAL = "#0f766e";
const ORANGE = "#f97316";
const INDIGO = "#6366f1";
const ROSE = "#e11d48";

const EVENT_COLORS = {
  beaches: "#f7a072",
  forts: "#64b5f6",
  temples: "#ba68c8",
  waterfalls: "#4dd0e1",
  mangoes: "#ffd54f",
};

const num = (v) => Number(v) || 0;
const pct = (part, total) => (num(total) > 0 ? Math.round((num(part) / num(total)) * 100) : 0);
const cap = (s) => String(s || "").replace(/^./, (c) => c.toUpperCase());
const ratio = (a, b) => (num(b) > 0 ? (num(a) / num(b)).toFixed(1) : "–");
const healthColor = (p) => (p >= 75 ? "#16a34a" : p >= 40 ? "#f59e0b" : "#dc2626");
const healthLabel = (p) => (p >= 75 ? "Strong" : p >= 40 ? "Fair" : "Needs work");

/* ----------------------------- primitives ----------------------------- */

function Card({ title, subtitle, children, className = "", action }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="pt-2">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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

function MiniStat({ icon: Icon, label, value, hint, accent = TEAL }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {hint && <p className="text-[11px] text-gray-400 truncate">{hint}</p>}
      </div>
    </div>
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

function HBars({ data, color = TEAL, colorFor, showShare = false }) {
  const items = data || [];
  const max = Math.max(1, ...items.map((d) => num(d.value)));
  const total = items.reduce((s, d) => s + num(d.value), 0);
  if (items.length === 0) return <Empty />;
  return (
    <ul className="space-y-3">
      {items.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="truncate pr-2 text-gray-700">{d.label}</span>
            <span className="font-semibold text-gray-900">
              {d.value}
              {showShare && <span className="font-normal text-gray-400"> ({pct(d.value, total)}%)</span>}
            </span>
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

function ColumnChart({ data, color = TEAL, highlightMax = false }) {
  const items = data || [];
  const max = Math.max(1, ...items.map((d) => num(d.value)));
  if (items.length === 0) return <Empty />;
  return (
    <div className="flex items-end justify-between gap-3 h-44 pt-4">
      {items.map((d) => {
        const isPeak = highlightMax && num(d.value) === max && max > 0;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end h-full">
            <span className="text-xs font-semibold text-gray-700 mb-1">{d.value}</span>
            <div
              className="w-full max-w-[44px] rounded-t-md transition-all"
              style={{
                height: `${Math.max((num(d.value) / max) * 100, num(d.value) > 0 ? 6 : 2)}%`,
                background: num(d.value) > 0 ? (isPeak ? ORANGE : color) : "#e5e7eb",
              }}
            />
            <span className="text-[11px] text-gray-500 mt-2">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Progress({ label, part, total, hint }) {
  const p = pct(part, total);
  const color = healthColor(p);
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

/** Radial gauge for the overall content-health score */
function Gauge100({ value, size = 130 }) {
  const color = healthColor(value);
  const thickness = 14;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-[11px] font-semibold" style={{ color }}>{healthLabel(value)}</span>
      </div>
    </div>
  );
}

/** Simple table of label / count / share, used under the charts */
function BreakdownTable({ data, labelHeader = "Category", transform = (s) => s }) {
  const items = data || [];
  const total = items.reduce((s, d) => s + num(d.value), 0);
  if (items.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
            <th className="py-2 pr-3 font-semibold">{labelHeader}</th>
            <th className="py-2 px-3 text-right font-semibold">Count</th>
            <th className="py-2 pl-3 text-right font-semibold">Share</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.label} className="border-b border-gray-50 last:border-0">
              <td className="py-2 pr-3 text-gray-700">{transform(d.label)}</td>
              <td className="py-2 px-3 text-right font-semibold text-gray-900">{num(d.value)}</td>
              <td className="py-2 pl-3 text-right text-gray-500">{pct(d.value, total)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 text-gray-900">
            <td className="py-2 pr-3 font-semibold">Total</td>
            <td className="py-2 px-3 text-right font-semibold">{total}</td>
            <td className="py-2 pl-3 text-right text-gray-500">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Plain list of names (used for "fix these" gap lists) */
function NameList({ items, empty = "Nothing to fix here.", render }) {
  const list = items || [];
  if (list.length === 0)
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-green-700">
        <CheckCircle2 size={16} /> {empty}
      </p>
    );
  return (
    <ul className="divide-y divide-gray-50 text-sm">
      {list.map((it, i) => (
        <li key={i} className="flex items-center justify-between gap-3 py-2">
          <span className="truncate text-gray-800">{render ? render(it).main : it.label}</span>
          <span className="shrink-0 text-xs text-gray-400">{render ? render(it).side : it.area}</span>
        </li>
      ))}
    </ul>
  );
}

const STATUS_STYLES = {
  "Needs homestays": "bg-amber-100 text-amber-800",
  "Needs attractions": "bg-sky-100 text-sky-800",
  Balanced: "bg-green-100 text-green-800",
  "No data": "bg-gray-100 text-gray-500",
};

/* --------------------------- PDF generation --------------------------- */

async function buildPdf({ data, talukaRows, insights, stats }) {
  // Lazy-loaded so the ~200 KB libraries only download when someone exports.
  const [{ jsPDF }, atMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = atMod.default || atMod.autoTable;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const CW = W - M * 2;
  let y = M;

  const t = data.totals || {};
  const p = data.pending || {};
  const lr = data.location_readiness || {};
  const hr = data.homestay_readiness || {};
  const st = data.stories || {};

  const ensure = (h) => {
    if (y + h > H - 50) {
      doc.addPage();
      y = M;
    }
  };

  const heading = (text, sub) => {
    ensure(sub ? 46 : 32);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(15, 23, 42);
    doc.text(text, M, y);
    y += 6;
    doc.setDrawColor(15, 118, 110).setLineWidth(1.5).line(M, y, M + 36, y);
    y += 14;
    if (sub) {
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100, 116, 139);
      doc.text(sub, M, y);
      y += 14;
    }
  };

  const paragraph = (text, color = [51, 65, 85]) => {
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW);
    ensure(lines.length * 13 + 4);
    doc.text(lines, M, y);
    y += lines.length * 13 + 4;
  };

  const table = (head, body, opts = {}) => {
    if (!body.length) return;
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      margin: { left: M, right: M },
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 5, textColor: [30, 41, 59] },
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      ...opts,
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 16;
  };

  // Horizontal bar list drawn with plain rectangles
  const bars = (items, color, { colorFor, labelTransform = (s) => s } = {}) => {
    const list = items || [];
    if (!list.length) return paragraph("No data yet.", [148, 163, 184]);
    const max = Math.max(1, ...list.map((d) => num(d.value)));
    const total = list.reduce((s, d) => s + num(d.value), 0);
    const labelW = 150;
    const barW = CW - labelW - 70;
    list.forEach((d, i) => {
      ensure(20);
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(51, 65, 85);
      const label = doc.splitTextToSize(String(labelTransform(d.label)), labelW - 8)[0];
      doc.text(label, M, y + 8);
      doc.setFillColor(241, 245, 249).roundedRect(M + labelW, y, barW, 10, 3, 3, "F");
      const w = Math.max((num(d.value) / max) * barW, num(d.value) > 0 ? 4 : 0);
      if (w > 0) doc.setFillColor(colorFor ? colorFor(d, i) : color).roundedRect(M + labelW, y, w, 10, 3, 3, "F");
      doc.setFont("helvetica", "bold").setTextColor(15, 23, 42);
      doc.text(`${num(d.value)} (${pct(d.value, total)}%)`, M + labelW + barW + 8, y + 8);
      y += 20;
    });
    y += 8;
  };

  const progressBars = (rows) => {
    rows.forEach(({ label, part, total }) => {
      ensure(30);
      const pc = pct(part, total);
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(51, 65, 85);
      doc.text(label, M, y + 8);
      doc.setFont("helvetica", "bold").setTextColor(15, 23, 42);
      doc.text(`${num(part)}/${num(total)}  (${pc}%)`, M + CW, y + 8, { align: "right" });
      y += 14;
      doc.setFillColor(241, 245, 249).roundedRect(M, y, CW, 8, 3, 3, "F");
      if (pc > 0) doc.setFillColor(healthColor(pc)).roundedRect(M, y, Math.max((pc / 100) * CW, 4), 8, 3, 3, "F");
      y += 20;
    });
    y += 4;
  };

  /* ---- Cover / header ---- */
  doc.setFillColor(12, 42, 46).rect(0, 0, W, 96, "F");
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(255, 255, 255);
  doc.text("Tourism Analytics Report", M, 46);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(167, 243, 208);
  const stamp = new Date().toLocaleString("en-IN", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  doc.text(`Generated ${stamp}`, M, 66);
  doc.setTextColor(203, 213, 225);
  doc.text("Where tourism content stands, and what needs attention.", M, 82);
  y = 124;

  /* ---- Summary ---- */
  heading("Summary");
  const kpis = [
    ["Locations", num(t.locations), `${num(p.locations)} pending review`],
    ["Homestays", num(t.homestays), `${num(p.homestays)} pending review`],
    ["Events (approved)", num(t.events_approved), `${num(p.events)} awaiting approval`],
    ["Stories published", num(t.stories_published), `${num(st.drafts)} drafts`],
    ["Drivers", num(t.drivers), `${num(p.drivers)} pending`],
    ["Bus stops", num(t.bus_stops), "Mapped stops"],
    ["Eco & water points", num(t.eco_water), "Eco / water points"],
    ["Village profiles", num(t.village_profiles), "Curated village pages"],
  ];
  const boxW = (CW - 3 * 10) / 4;
  for (let row = 0; row < 2; row++) {
    ensure(60);
    kpis.slice(row * 4, row * 4 + 4).forEach(([label, value, sub], i) => {
      const x = M + i * (boxW + 10);
      doc.setFillColor(248, 250, 252).setDrawColor(226, 232, 240).roundedRect(x, y, boxW, 52, 5, 5, "FD");
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(100, 116, 139);
      doc.text(label, x + 8, y + 14);
      doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(15, 23, 42);
      doc.text(String(value), x + 8, y + 35);
      doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(148, 163, 184);
      doc.text(sub, x + 8, y + 46);
    });
    y += 62;
  }
  y += 4;

  table(
    ["Key metric", "Value"],
    [
      ["Content health score", `${stats.health}/100 (${healthLabel(stats.health)})`],
      ["Total submissions awaiting review", String(stats.pendingTotal)],
      ["Homestays per attraction", ratio(t.homestays, t.locations)],
      ["Average views per published story", String(stats.avgViews)],
      ["Average comments per published story", String(stats.avgComments)],
      ["Approved events in the next 6 months", String(stats.eventsNext6)],
      ["Busiest month for events", stats.peakMonth ? `${stats.peakMonth.label} (${stats.peakMonth.value})` : "–"],
    ],
    { columnStyles: { 1: { halign: "right", fontStyle: "bold" } } }
  );

  /* ---- Needs attention ---- */
  heading("Needs attention", "Generated automatically from the latest data");
  if (insights.length === 0) paragraph("Everything looks good. Nothing needs action right now.", [21, 128, 61]);
  else
    table(
      ["Priority", "Item"],
      insights.map((i) => [i.level === "warn" ? "High" : "Info", i.text]),
      {
        columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" } },
        didParseCell: (d) => {
          if (d.section === "body" && d.column.index === 0)
            d.cell.styles.textColor = d.cell.raw === "High" ? [180, 83, 9] : [3, 105, 161];
        },
      }
    );

  /* ---- Coverage ---- */
  heading("Coverage by taluka", "Attractions vs homestays. Gaps show where to add listings.");
  table(
    ["Taluka", "Locations", "Share", "Homestays", "Share", "Homestays / location", "Status"],
    talukaRows.map((r) => [
      r.label, r.locations, `${pct(r.locations, stats.totalLoc)}%`,
      r.homestays, `${pct(r.homestays, stats.totalHs)}%`,
      ratio(r.homestays, r.locations), r.status,
    ]),
    {
      columnStyles: {
        1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" },
        4: { halign: "right" }, 5: { halign: "right" },
      },
    }
  );

  heading("Attractions by type");
  bars(data.locations_by_type, TEAL, { colorFor: (_, i) => PALETTE[i % PALETTE.length] });

  heading("Homestays by type");
  bars(data.homestays_by_type, ORANGE);

  heading("Road condition to attractions");
  bars(data.road_condition, TEAL, { colorFor: (_, i) => ROAD_COLORS[i % ROAD_COLORS.length] });

  /* ---- Readiness ---- */
  heading("Location data quality", "Complete listings convert better. Aim for 75%+.");
  progressBars([
    { label: "Have photos", part: lr.with_photos, total: lr.total },
    { label: "Have map coordinates", part: lr.with_coordinates, total: lr.total },
    { label: "Have signboards on the way", part: lr.with_signboards, total: lr.total },
  ]);

  heading("Homestay readiness", "How ready hosts are for tourists");
  progressBars([
    { label: "Registered with MTDC", part: hr.mtdc_registered, total: hr.total },
    { label: "Accept digital payments", part: hr.digital_payments, total: hr.total },
    { label: "Listed on an online booking platform", part: hr.listed_online, total: hr.total },
  ]);

  /* ---- Events ---- */
  heading("Events, next 6 months", "Approved events per month");
  bars(data.events_by_month, INDIGO);

  heading("Events by category", "Approved events");
  bars(data.events_by_category, TEAL, {
    labelTransform: cap,
    colorFor: (d) => EVENT_COLORS[String(d.label).toLowerCase()] || TEAL,
  });

  /* ---- Stories ---- */
  heading("Stories", `${num(t.stories_published)} published, ${num(st.drafts)} drafts, ${num(st.total_views)} total views, ${num(st.comments)} comments`);
  table(
    ["Rank", "Story", "Views"],
    (st.top || []).map((s, i) => [i + 1, s.label, num(s.value)]),
    { columnStyles: { 0: { cellWidth: 40 }, 2: { halign: "right", cellWidth: 60 } } }
  );

  /* ---- Facilities & services ---- */
  const lf = data.location_facilities || {};
  const hf = data.homestay_facilities || {};
  const at = data.atms || {};
  const hs = data.health_services || {};
  const ct = data.content || {};
  const hp = data.hidden_paths || {};
  const ev = data.events_summary || {};
  const gp = data.gaps || {};

  heading("Top villages by attractions");
  bars(data.locations_by_village, TEAL);

  heading("Location facilities", "Share of listed attractions that offer each facility");
  progressBars([
    { label: "Parking available", part: lf.parking, total: lf.total },
    { label: "Food stalls nearby", part: lf.food_stalls, total: lf.total },
    { label: "Public transport access", part: lf.public_transport, total: lf.total },
    { label: "Free entry", part: lf.free_entry, total: lf.total },
  ]);

  heading("Homestay facilities");
  progressBars([
    { label: "Vegetarian meals", part: hf.veg_meals, total: hf.total },
    { label: "Guides available", part: hf.guides, total: hf.total },
    { label: "Host lives on premises", part: hf.host_on_site, total: hf.total },
    { label: "Discoverable on Google Maps", part: hf.on_google_maps, total: hf.total },
    { label: "Has a social media page", part: hf.social_media, total: hf.total },
  ]);

  heading("Transport, cash and safety");
  table(
    ["Item", "Count"],
    [
      ["Drivers registered", num(t.drivers)],
      ["Bus stops mapped", num(t.bus_stops)],
      ["ATMs", `${num(at.total)} (${num(at.open_24x7)} open 24x7, ${num(at.cash_deposit)} with cash deposit)`],
      ["Medical facilities", `${num(t.medical_facilities)} (${num(hs.medical_with_emergency)} with emergency care)`],
      ["Police stations", `${num(t.police_stations)} (${num(hs.police_tourist_help)} with tourist help)`],
    ],
    { columnStyles: { 1: { halign: "right", fontStyle: "bold" } } }
  );
  heading("Drivers by taluka");
  bars(data.drivers_by_taluka, "#0ea5e9");
  heading("Bus stops by taluka");
  bars(data.bus_stops_by_taluka, "#eab308");

  heading("Content library");
  table(
    ["Content", "Published", "Drafts"],
    [
      ["Itineraries", num(ct.itineraries?.published), num(ct.itineraries?.drafts)],
      ["Circuits", num(ct.circuits?.published), num(ct.circuits?.drafts)],
      ["Explore Villages pages", num(ct.explore_villages?.published), num(ct.explore_villages?.drafts)],
      ["Local experiences", num(t.experiences), num(ct.experiences_drafts)],
      ["Stories", num(t.stories_published), num(st.drafts)],
    ],
    { columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } } }
  );
  heading("Hidden paths", `${num(t.hidden_paths)} published, ${num(hp.total_km)} km in total`);
  bars(hp.by_status, TEAL, { labelTransform: cap });

  heading("Events summary");
  table(
    ["Measure", "Count"],
    [
      ["Approved events in the next 30 days", num(ev.upcoming_30_days)],
      ["Past approved events", num(ev.past)],
      ["Awaiting approval", num(ev.pending)],
    ],
    { columnStyles: { 1: { halign: "right", fontStyle: "bold" } } }
  );

  heading("Gaps to fill", "Concrete items behind the attention list");
  table(
    ["Villages with places but no Explore page", "Taluka", "Places"],
    (gp.villages_without_page_list || []).map((v) => [v.village, v.taluka, num(v.places)]),
    { columnStyles: { 2: { halign: "right" } } }
  );
  table(
    ["Locations without photos", "Taluka"],
    (gp.locations_without_photos || []).map((r) => [r.label, r.area])
  );
  table(
    ["Locations without coordinates", "Taluka"],
    (gp.locations_without_coordinates || []).map((r) => [r.label, r.area])
  );

  /* ---- Footer on every page ---- */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240).setLineWidth(0.5).line(M, H - 34, W - M, H - 34);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(148, 163, 184);
    doc.text("Tourism Administration Panel · Analytics report", M, H - 20);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 20, { align: "right" });
  }

  const d = new Date();
  const file = `tourism-analytics-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.pdf`;
  doc.save(file);
}

/* ------------------------------- main -------------------------------- */

export default function AnalyticsDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [sort, setSort] = useState({ key: "total", dir: "desc" });

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
    return Object.values(map)
      .map((r) => ({
        ...r,
        total: r.locations + r.homestays,
        status:
          r.locations === 0 && r.homestays === 0
            ? "No data"
            : r.locations > 0 && r.homestays === 0
            ? "Needs homestays"
            : r.locations === 0 && r.homestays > 0
            ? "Needs attractions"
            : r.homestays / r.locations < 0.5
            ? "Needs homestays"
            : "Balanced",
      }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const sortedTalukas = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (r) =>
      sort.key === "label" ? r.label.toLowerCase()
      : sort.key === "ratio" ? (r.locations > 0 ? r.homestays / r.locations : -1)
      : r[sort.key];
    return [...talukaRows].sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
  }, [talukaRows, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "label" ? "asc" : "desc" }));

  // Derived headline numbers
  const stats = useMemo(() => {
    if (!data) return null;
    const t = data.totals || {};
    const p = data.pending || {};
    const lr = data.location_readiness || {};
    const hr = data.homestay_readiness || {};
    const st = data.stories || {};
    const months = data.events_by_month || [];

    const scores = [
      lr.total > 0 && pct(lr.with_photos, lr.total),
      lr.total > 0 && pct(lr.with_coordinates, lr.total),
      lr.total > 0 && pct(lr.with_signboards, lr.total),
      hr.total > 0 && pct(hr.mtdc_registered, hr.total),
      hr.total > 0 && pct(hr.digital_payments, hr.total),
      hr.total > 0 && pct(hr.listed_online, hr.total),
    ].filter((s) => s !== false);
    const health = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const locScore = lr.total > 0
      ? Math.round((pct(lr.with_photos, lr.total) + pct(lr.with_coordinates, lr.total) + pct(lr.with_signboards, lr.total)) / 3)
      : 0;
    const hsScore = hr.total > 0
      ? Math.round((pct(hr.mtdc_registered, hr.total) + pct(hr.digital_payments, hr.total) + pct(hr.listed_online, hr.total)) / 3)
      : 0;

    const published = num(t.stories_published);
    const peakMonth = months.reduce((best, m) => (num(m.value) > num(best?.value) ? m : best), null);

    return {
      health,
      locScore,
      hsScore,
      pendingTotal: num(p.locations) + num(p.homestays) + num(p.events) + num(p.drivers),
      avgViews: published > 0 ? Math.round(num(st.total_views) / published) : 0,
      avgComments: published > 0 ? (num(st.comments) / published).toFixed(1) : "0",
      eventsNext6: months.reduce((s, m) => s + num(m.value), 0),
      peakMonth: peakMonth && num(peakMonth.value) > 0 ? peakMonth : null,
      totalLoc: talukaRows.reduce((s, r) => s + r.locations, 0),
      totalHs: talukaRows.reduce((s, r) => s + r.homestays, 0),
      draftShare: published + num(st.drafts) > 0 ? pct(st.drafts, published + num(st.drafts)) : 0,
    };
  }, [data, talukaRows]);

  // Auto-generated "what needs attention" list
  const insights = useMemo(() => {
    if (!data) return [];
    const out = [];
    const p = data.pending || {};
    const lr = data.location_readiness || {};
    const hr = data.homestay_readiness || {};
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

    if (num(p.drivers) > 0)
      out.push({
        level: "info",
        text: `${num(p.drivers)} driver registration${num(p.drivers) > 1 ? "s are" : " is"} pending.`,
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

    if (num(hr.total) > 0 && pct(hr.digital_payments, hr.total) < 50)
      out.push({
        level: "info",
        text: `Only ${pct(hr.digital_payments, hr.total)}% of homestays accept digital payments. Tourists increasingly expect UPI.`,
      });

    if (num(hr.total) > 0 && pct(hr.mtdc_registered, hr.total) < 50)
      out.push({
        level: "info",
        text: `Only ${pct(hr.mtdc_registered, hr.total)}% of homestays are registered with MTDC.`,
      });

    if (num(st.drafts) > 0)
      out.push({
        level: "info",
        text: `${num(st.drafts)} stor${num(st.drafts) > 1 ? "ies are" : "y is"} still in draft.`,
        action: "Open stories",
        tab: "addEditItineraries",
      });

    const pa = data.pending_age || {};
    if (num(pa.over_7_days) > 0)
      out.push({
        level: "warn",
        text: `${num(pa.over_7_days)} submission${num(pa.over_7_days) > 1 ? "s have" : " has"} been waiting more than 7 days (oldest: ${num(pa.oldest_days)} days).`,
        action: "Review now",
        tab: "pendingSubmissions",
      });

    const gp = data.gaps || {};
    if (num(gp.villages_without_page) > 0)
      out.push({
        level: "info",
        text: `${num(gp.villages_without_page)} of ${num(gp.villages_total)} villages with listed places have no Explore Villages page yet.`,
        action: "Add pages",
        tab: "exploreVillages",
      });

    const thisMonth = (data.events_by_month || [])[0];
    if (thisMonth && num(thisMonth.value) === 0)
      out.push({
        level: "info",
        text: `No approved events scheduled for ${thisMonth.label}. The public calendar will look empty.`,
        action: "Manage events",
        tab: "events",
      });

    return out;
  }, [data, talukaRows]);

  const handleExport = async () => {
    if (!data || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      await buildPdf({ data, talukaRows, insights, stats });
    } catch (e) {
      console.error(e);
      setExportError(
        /jspdf/i.test(String(e?.message))
          ? "PDF libraries are missing. Run: npm install jspdf jspdf-autotable"
          : "Could not create the PDF. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

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
  const SortHead = ({ k, children, right }) => (
    <th className={`py-2 px-3 font-semibold ${right ? "text-right" : "text-left"}`}>
      <button
        onClick={() => toggleSort(k)}
        className={`inline-flex items-center gap-1 hover:text-gray-800 ${sort.key === k ? "text-gray-900" : ""}`}
      >
        {children}
        <ArrowUpDown size={12} className={sort.key === k ? "text-teal-600" : "text-gray-300"} />
      </button>
    </th>
  );

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
        <div className="flex items-center gap-3 flex-wrap">
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
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {exporting ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div>
      )}

      {/* Health score + needs attention */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Content health" subtitle="Average of all completeness checks below" className="lg:col-span-1">
          <div className="flex items-center gap-5">
            <Gauge100 value={stats.health} />
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-500">Locations</span>
                <span className="ml-2 font-semibold" style={{ color: healthColor(stats.locScore) }}>{stats.locScore}%</span>
              </li>
              <li>
                <span className="text-gray-500">Homestays</span>
                <span className="ml-2 font-semibold" style={{ color: healthColor(stats.hsScore) }}>{stats.hsScore}%</span>
              </li>
              <li>
                <span className="text-gray-500">Awaiting review</span>
                <span className="ml-2 font-semibold text-gray-900">{stats.pendingTotal}</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card
          title="Needs your attention"
          subtitle={`${insights.length} item${insights.length === 1 ? "" : "s"}, generated automatically from the latest data`}
          className="lg:col-span-2"
        >
          {insights.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 size={18} /> Everything looks good. Nothing needs action right now.
            </div>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
      </div>

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
          sub={`${num(st.drafts)} in draft · ${num(st.total_views)} views`}
          onClick={go("addEditItineraries")} />
        <StatCard icon={Car} label="Drivers" value={num(t.drivers)} accent="#0ea5e9"
          sub={num(p.drivers) ? `${num(p.drivers)} pending` : "Registered drivers"} />
        <StatCard icon={Bus} label="Bus stops" value={num(t.bus_stops)} accent="#eab308" sub="Mapped stops" />
        <StatCard icon={Leaf} label="Eco & water" value={num(t.eco_water)} accent="#84cc16" sub="Eco / water points" />
        <StatCard icon={Landmark} label="Village profiles" value={num(t.village_profiles)} accent="#a855f7"
          sub="Curated village pages" onClick={go("villageProfiles")} />
      </div>

      {/* Quick ratios */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={Home} accent={ORANGE} label="Homestays per attraction"
          value={ratio(t.homestays, t.locations)} hint="Higher means better lodging coverage" />
        <MiniStat icon={Inbox} accent={TEAL} label="Awaiting review"
          value={stats.pendingTotal} hint="Locations, homestays, events, drivers" />
        <MiniStat icon={Eye} accent={ROSE} label="Avg. views per story"
          value={stats.avgViews} hint={`${num(st.total_views)} views across ${num(t.stories_published)} stories`} />
        <MiniStat icon={MessageSquare} accent={INDIGO} label="Avg. comments per story"
          value={stats.avgComments} hint={`${num(st.comments)} comments in total`} />
      </div>

      {/* Coverage by taluka */}
      <SectionHeading title="Coverage" subtitle="Where attractions and accommodation are, and where they are missing." />
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

      <Card title="Taluka detail" subtitle="Click a column to sort. Status compares homestays against attractions.">
        {sortedTalukas.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <SortHead k="label">Taluka</SortHead>
                  <SortHead k="locations" right>Locations</SortHead>
                  <th className="py-2 px-3 text-right font-semibold">Share</th>
                  <SortHead k="homestays" right>Homestays</SortHead>
                  <th className="py-2 px-3 text-right font-semibold">Share</th>
                  <SortHead k="ratio" right>Homestays / location</SortHead>
                  <th className="py-2 px-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTalukas.map((r) => (
                  <tr key={r.label} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="py-2 px-3 font-medium text-gray-800">{r.label}</td>
                    <td className="py-2 px-3 text-right text-gray-900">{r.locations}</td>
                    <td className="py-2 px-3 text-right text-gray-400">{pct(r.locations, stats.totalLoc)}%</td>
                    <td className="py-2 px-3 text-right text-gray-900">{r.homestays}</td>
                    <td className="py-2 px-3 text-right text-gray-400">{pct(r.homestays, stats.totalHs)}%</td>
                    <td className="py-2 px-3 text-right text-gray-900">{ratio(r.homestays, r.locations)}</td>
                    <td className="py-2 px-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 font-semibold text-gray-900">
                  <td className="py-2 px-3">All talukas</td>
                  <td className="py-2 px-3 text-right">{stats.totalLoc}</td>
                  <td />
                  <td className="py-2 px-3 text-right">{stats.totalHs}</td>
                  <td />
                  <td className="py-2 px-3 text-right">{ratio(stats.totalHs, stats.totalLoc)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Breakdowns */}
      <SectionHeading title="Breakdowns" subtitle="What is listed and how reachable it is." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Attractions by type: detail">
          <BreakdownTable data={data.locations_by_type} labelHeader="Type" transform={cap} />
        </Card>
        <Card title="Road condition to attractions" subtitle="Accessibility of listed locations">
          <Donut data={data.road_condition} centerLabel="locations" colors={ROAD_COLORS} />
        </Card>
        <Card title="Homestays by type" subtitle="Mix of accommodation on offer">
          <HBars data={data.homestays_by_type} color={ORANGE} showShare />
        </Card>
        <Card title="Road condition: detail">
          <BreakdownTable data={data.road_condition} labelHeader="Condition" transform={cap} />
        </Card>
      </div>

      {/* Readiness */}
      <SectionHeading title="Data quality" subtitle="How complete and tourist-ready the listings are." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Location data quality"
          subtitle="Complete listings convert better. Aim for 75%+."
          action={<span className="text-sm font-bold" style={{ color: healthColor(stats.locScore) }}>{stats.locScore}%</span>}
        >
          <div className="space-y-4">
            <Progress label="Have photos" part={lr.with_photos} total={lr.total}
              hint={num(lr.total) - num(lr.with_photos) > 0 ? `${num(lr.total) - num(lr.with_photos)} still need photos` : "All locations covered"} />
            <Progress label="Have map coordinates" part={lr.with_coordinates} total={lr.total}
              hint={num(lr.total) - num(lr.with_coordinates) > 0 ? `${num(lr.total) - num(lr.with_coordinates)} missing from the map` : "All locations covered"} />
            <Progress label="Have signboards on the way" part={lr.with_signboards} total={lr.total}
              hint={num(lr.total) - num(lr.with_signboards) > 0 ? `${num(lr.total) - num(lr.with_signboards)} without signboards` : "All locations covered"} />
          </div>
        </Card>
        <Card
          title="Homestay readiness"
          subtitle="How ready hosts are for tourists"
          action={<span className="text-sm font-bold" style={{ color: healthColor(stats.hsScore) }}>{stats.hsScore}%</span>}
        >
          <div className="space-y-4">
            <Progress label="Registered with MTDC" part={hr.mtdc_registered} total={hr.total}
              hint={num(hr.total) - num(hr.mtdc_registered) > 0 ? `${num(hr.total) - num(hr.mtdc_registered)} not registered` : "All homestays registered"} />
            <Progress label="Accept digital payments" part={hr.digital_payments} total={hr.total}
              hint={num(hr.total) - num(hr.digital_payments) > 0 ? `${num(hr.total) - num(hr.digital_payments)} cash only` : "All accept digital payments"} />
            <Progress label="Listed on an online booking platform" part={hr.listed_online} total={hr.total}
              hint={num(hr.total) - num(hr.listed_online) > 0 ? `${num(hr.total) - num(hr.listed_online)} not listed online` : "All listed online"} />
          </div>
        </Card>
      </div>

      {/* Facilities & services */}
      <SectionHeading title="Facilities and services" subtitle="What visitors can count on once they arrive." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Location facilities" subtitle="Share of attractions offering each facility">
          <div className="space-y-4">
            <Progress label="Parking available" part={data.location_facilities?.parking} total={data.location_facilities?.total} />
            <Progress label="Food stalls nearby" part={data.location_facilities?.food_stalls} total={data.location_facilities?.total} />
            <Progress label="Public transport access" part={data.location_facilities?.public_transport} total={data.location_facilities?.total} />
            <Progress label="Free entry" part={data.location_facilities?.free_entry} total={data.location_facilities?.total} />
          </div>
        </Card>
        <Card title="Homestay facilities" subtitle="Share of homestays offering each service">
          <div className="space-y-4">
            <Progress label="Vegetarian meals" part={data.homestay_facilities?.veg_meals} total={data.homestay_facilities?.total} />
            <Progress label="Guides available" part={data.homestay_facilities?.guides} total={data.homestay_facilities?.total} />
            <Progress label="Host lives on premises" part={data.homestay_facilities?.host_on_site} total={data.homestay_facilities?.total} />
            <Progress label="Discoverable on Google Maps" part={data.homestay_facilities?.on_google_maps} total={data.homestay_facilities?.total} />
            <Progress label="Has a social media page" part={data.homestay_facilities?.social_media} total={data.homestay_facilities?.total} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={Landmark} accent="#0ea5e9" label="ATMs" value={num(t.atms)}
          hint={`${num(data.atms?.open_24x7)} open 24x7 · ${num(data.atms?.cash_deposit)} deposit`} />
        <MiniStat icon={Home} accent="#e11d48" label="Medical facilities" value={num(t.medical_facilities)}
          hint={`${num(data.health_services?.medical_with_emergency)} with emergency care`} />
        <MiniStat icon={MapPin} accent="#6366f1" label="Police stations" value={num(t.police_stations)}
          hint={`${num(data.health_services?.police_tourist_help)} with tourist help`} />
        <MiniStat icon={Leaf} accent="#84cc16" label="Hidden paths" value={num(t.hidden_paths)}
          hint={`${num(data.hidden_paths?.total_km)} km · ${num(p.hidden_paths)} pending`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Top villages" subtitle="By number of attractions">
          <HBars data={data.locations_by_village} color={TEAL} />
        </Card>
        <Card title="Drivers by taluka" subtitle="Where transport is available">
          <HBars data={data.drivers_by_taluka} color="#0ea5e9" />
        </Card>
        <Card title="Bus stops by taluka" subtitle="Mapped public transport">
          <HBars data={data.bus_stops_by_taluka} color="#eab308" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Crowd level" subtitle="As reported for attractions">
          <Donut data={data.locations_by_crowd} centerLabel="locations" />
        </Card>
        <Card title="Seasonal availability" subtitle="When attractions can be visited">
          <HBars data={data.locations_by_season} color="#f97316" showShare />
        </Card>
        <Card title="ATMs by bank">
          <HBars data={data.atms?.by_bank} color="#0ea5e9" />
        </Card>
      </div>

      {/* Content library */}
      <SectionHeading title="Content library" subtitle="What has been published and what is still in draft." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Published vs draft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="py-2 pr-3 font-semibold">Content</th>
                  <th className="py-2 px-3 text-right font-semibold">Published</th>
                  <th className="py-2 pl-3 text-right font-semibold">Drafts</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Itineraries", data.content?.itineraries?.published, data.content?.itineraries?.drafts],
                  ["Circuits", data.content?.circuits?.published, data.content?.circuits?.drafts],
                  ["Explore Villages", data.content?.explore_villages?.published, data.content?.explore_villages?.drafts],
                  ["Local experiences", t.experiences, data.content?.experiences_drafts],
                  ["Stories", t.stories_published, st.drafts],
                ].map(([label, pub, dr]) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-3 text-gray-700">{label}</td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-900">{num(pub)}</td>
                    <td className="py-2 pl-3 text-right text-gray-500">{num(dr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Local experiences" subtitle="Published, by category">
          <HBars data={(data.content?.experiences_by_category || []).map((d) => ({ ...d, label: cap(String(d.label).replace(/-/g, " ")) }))} color="#a855f7" />
        </Card>
        <Card title="Hidden paths by status" subtitle="Including submissions under review">
          <Donut data={(data.hidden_paths?.by_status || []).map((d) => ({ ...d, label: cap(String(d.label).replace(/_/g, " ")) }))} centerLabel="paths" />
        </Card>
      </div>

      {/* Gaps */}
      <SectionHeading title="Gaps to fill" subtitle="The specific records behind the attention list." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Villages without an Explore page"
          subtitle={`${num(data.gaps?.villages_without_page)} of ${num(data.gaps?.villages_total)} villages`}
          action={onNavigate && (
            <button onClick={() => onNavigate("exploreVillages")} className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
              Add <ArrowRight size={12} />
            </button>
          )}
        >
          <NameList
            items={data.gaps?.villages_without_page_list}
            empty="Every village with places has a page."
            render={(v) => ({ main: `${v.village} (${v.taluka})`, side: `${num(v.places)} place${num(v.places) === 1 ? "" : "s"}` })}
          />
        </Card>
        <Card title="Locations without photos" subtitle="First 10 alphabetically">
          <NameList items={data.gaps?.locations_without_photos} empty="Every location has photos." />
        </Card>
        <Card title="Locations missing coordinates" subtitle="These will not show on the map">
          <NameList items={data.gaps?.locations_without_coordinates} empty="Every location has coordinates." />
        </Card>
      </div>

      {/* Events + stories */}
      <SectionHeading title="Events and stories" subtitle="What is coming up and what visitors are reading." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Events, next 6 months"
          subtitle={`${stats.eventsNext6} approved${stats.peakMonth ? ` · busiest: ${stats.peakMonth.label}` : ""}`}
          className="lg:col-span-1"
        >
          <ColumnChart data={data.events_by_month} color={INDIGO} highlightMax />
        </Card>
        <Card title="Events by category" subtitle="Approved events" className="lg:col-span-1">
          <HBars
            data={(data.events_by_category || []).map((d) => ({ ...d, label: cap(d.label) }))}
            colorFor={(d) => EVENT_COLORS[String(d.label).toLowerCase()] || TEAL}
            showShare
          />
        </Card>
        <Card title="Top stories" subtitle="By views" className="lg:col-span-1">
          <HBars data={st.top} color={ROSE} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Events at a glance">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ["Next 30 days", num(data.events_summary?.upcoming_30_days)],
              ["Pending", num(data.events_summary?.pending)],
              ["Past", num(data.events_summary?.past)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-gray-50 py-3">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Stories published per month" subtitle="Last 6 months">
          <ColumnChart data={st.published_by_month} color={ROSE} />
        </Card>
        <Card title="Stories by category" subtitle="Published">
          <HBars data={st.by_category} color={ROSE} showShare />
        </Card>
      </div>

      <Card title="Stories at a glance">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {[
            ["Published", num(t.stories_published)],
            ["Drafts", `${num(st.drafts)}${stats.draftShare ? ` (${stats.draftShare}%)` : ""}`],
            ["Total views", num(st.total_views)],
            ["Comments", num(st.comments)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 py-4">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}