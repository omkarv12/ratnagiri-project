import React from "react";

function timeAgo(ts) {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function draftProgress(data) {
    if (!data) return 0;
    const vals = Object.values(data);
    if (!vals.length) return 0;
    const filled = vals.filter((v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (v === null || v === undefined) return false;
        return String(v).trim() !== "";
    }).length;
    return Math.round((filled / vals.length) * 100);
}

/**
 * Fixed-position dialog offering to continue or discard a saved draft.
 * Pass `draft` as null/undefined to render nothing.
 *
 * - formLabel: e.g. "Homestay Registration" — used in the heading.
 * - nameField: key in draft.data to show as a friendly identifier (e.g. "homestay_name").
 * - note: optional extra line, e.g. to warn that photos aren't restorable.
 */
export default function DraftResumeModal({ draft, formLabel, nameField, note, onContinue, onDiscard }) {
    if (!draft) return null;

    const pct = draftProgress(draft.data);
    const name = nameField && draft.data?.[nameField];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">

                <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl" aria-hidden="true">📝</span>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">
                            Unfinished {formLabel}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Saved {timeAgo(draft.savedAt)}
                            {name ? ` — ${name}` : ""}. Continue where you left off?
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Progress</span>
                        <span>{pct}% filled</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-orange-600 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                {note && (
                    <p className="mt-3 text-[11px] text-slate-400">{note}</p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onDiscard}
                        className="px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Start New
                    </button>
                    <button
                        type="button"
                        onClick={onContinue}
                        className="px-3 py-2 text-xs font-bold rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                    >
                        Continue Draft
                    </button>
                </div>

                <p className="mt-2 text-center text-[10px] text-slate-400">
                    "Start New" permanently deletes the saved draft.
                </p>

            </div>
        </div>
    );
}