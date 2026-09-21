import { useState, useEffect } from "react";

/**
 * Handles draft save/detect/restore for a registration form.
 *
 * - On mount, checks localStorage for a saved draft under `key` and, if one
 *   has real content, exposes it as `pendingDraft` instead of auto-restoring
 *   it or using window.confirm — the form decides how to ask the user.
 * - Autosaves `formData` on every change, but only AFTER the initial check
 *   has resolved and only while there's no pending decision — this stops a
 *   fresh, empty formData from silently overwriting a saved draft on mount.
 * - Backward-compatible with an older draft format that was just
 *   `JSON.stringify(formData)` with no wrapper.
 */
export function useFormDraft(key, formData, setFormData) {
    const [pendingDraft, setPendingDraft] = useState(null); // { data, savedAt } | null
    const [ready, setReady] = useState(false);

    // One-time check on mount.
    useEffect(() => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                const data = parsed && parsed.data ? parsed.data : parsed;
                const hasContent = Object.values(data || {}).some((v) =>
                    Array.isArray(v) ? v.length > 0 : !!v
                );

                if (hasContent) {
                    setPendingDraft({ data, savedAt: parsed.savedAt || Date.now() });
                } else {
                    localStorage.removeItem(key);
                }
            }
        } catch (err) {
            // Corrupt or inaccessible draft — ignore and start fresh.
        } finally {
            setReady(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Autosave — only once the initial check is done and there's no
    // unresolved "continue or start new?" decision pending.
    useEffect(() => {
        if (!ready || pendingDraft) return;
        try {
            localStorage.setItem(key, JSON.stringify({ data: formData, savedAt: Date.now() }));
        } catch (err) {
            // Storage full or unavailable — not critical, ignore.
        }
    }, [key, formData, ready, pendingDraft]);

    const continueDraft = () => {
        setFormData((prev) => ({ ...prev, ...pendingDraft.data }));
        setPendingDraft(null);
    };

    const discardDraft = () => {
        try {
            localStorage.removeItem(key);
        } catch (err) {
            // ignore
        }
        setPendingDraft(null);
    };

    const clearDraft = () => {
        try {
            localStorage.removeItem(key);
        } catch (err) {
            // ignore
        }
    };

    return { pendingDraft, continueDraft, discardDraft, clearDraft };
}