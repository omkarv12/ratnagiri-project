// Language codes shown as round chips on guide cards.
export const GUIDE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "kok", name: "Konkani" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ur", name: "Urdu" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
];

export const languageName = (code) =>
  GUIDE_LANGUAGES.find((l) => l.code === code)?.name || code;

// "a, b,c" -> ["a", "b", "c"]
export const splitCsv = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
