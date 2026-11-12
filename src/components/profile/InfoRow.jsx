// src/components/profile/InfoRow.jsx

function formatValue(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    const items = value.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
    return items.length ? items.join(", ") : null;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = String(value).trim();
  return text === "" ? null : text;
}

export default function InfoRow({ label, value }) {
  const display = formatValue(value);
  if (!display) return null;

  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-6">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900 break-words whitespace-pre-line">
        {display}
      </dd>
    </div>
  );
}