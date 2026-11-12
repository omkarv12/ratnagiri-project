import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, RotateCcw, MapPin, Compass } from "lucide-react";
import { MENUS } from "../config/navMenus";

/* ------------------------------------------------------------------ */
/*  Usage:  <ChatBot />                      -> works offline (FAQ mode) */
/*          <ChatBot apiUrl="/api/chat" />   -> AI answers (see chat-server.js) */
/*  If the API fails, it falls back to the built-in answers.            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "rt-chat-v1";

const GREETING = {
  id: "greeting",
  role: "bot",
  text: "Namaskar! I'm the Visit Ratnagiri guide. Ask me about beaches, forts, food, stays or how to get here.",
  actions: [{ label: "Open Interactive Map", route: "/map" }],
};

const QUICK = [
  "Best time to visit",
  "Top beaches",
  "Forts to see",
  "Local food",
  "How to reach",
  "Plan 2 days",
];

/* ---------- Built-in knowledge (general guidance only) ---------- */
const KB = [
  {
    keys: ["hello", "hi", "hey", "namaste", "namaskar", "good morning", "good evening"],
    answer: "Namaskar! What would you like to know about Ratnagiri?",
  },
  {
    keys: ["thanks", "thank you", "thx"],
    answer: "You're welcome! Ask me anything else about your trip.",
  },
  {
    keys: ["best time", "when", "season", "weather", "climate", "monsoon", "winter", "summer"],
    answer:
      "October to February is the most comfortable time: cool, dry and good for beaches and sightseeing. June to September brings heavy rain, green hills and waterfalls, but sea activities are usually restricted. April and May are hot, but that is Alphonso mango season.",
  },
  {
    keys: ["beach", "beaches", "sea", "swim", "ganpatipule", "bhatye", "aare ware", "guhagar", "mandvi", "anjarle"],
    answer:
      "Popular beaches are Ganpatipule (next to the Swayambhu Ganpati temple), Bhatye, Aare-Ware, Mandvi, Guhagar and Anjarle. Swim only where local guidance says it is safe, and avoid the sea during monsoon.",
    actions: [{ label: "See places on the map", route: "/map" }],
  },
  {
    keys: ["fort", "forts", "ratnadurg", "jaigad", "suvarnadurg", "history", "heritage"],
    answer:
      "Ratnadurg Fort in Ratnagiri town sits on a headland above the sea. Jaigad Fort and Suvarnadurg (near Harnai) are other well-known sea forts. Wear shoes with good grip and take care near cliff edges.",
  },
  {
    keys: ["temple", "temples", "ganpati", "velneshwar", "parshuram", "religious", "darshan"],
    answer:
      "Ganpatipule's Swayambhu Ganpati temple is the best known. Velneshwar and the Parshuram temple near Chiplun are also popular. Dress modestly and remove footwear where asked.",
  },
  {
    keys: ["mango", "mangoes", "alphonso", "hapus", "aamras", "orchard"],
    answer:
      "Ratnagiri is famous for Alphonso (Hapus) mangoes. The season runs roughly from April to May. Many orchards and local sellers offer boxes, but buy from trusted sellers and ask for the harvest date.",
  },
  {
    keys: ["food", "eat", "seafood", "restaurant", "konkani", "thali", "modak", "kokum", "fish", "veg"],
    answer:
      "Try a Konkani seafood thali, fish curry with rice, ukadiche modak and kokum sarbat. Vegetarian thalis and homestay meals are easy to find too.",
  },
  {
    keys: ["reach", "get there", "how to get", "train", "railway", "airport", "bus", "road", "mumbai", "pune", "distance", "transport"],
    answer:
      "Ratnagiri is on the Konkan Railway line, and the Mumbai–Goa highway (NH66) runs through the district. Mumbai and Pune are each roughly a 6–8 hour drive. Check train timings and any road work before you travel.",
  },
  {
    keys: ["stay", "hotel", "homestay", "resort", "accommodation", "room", "lodging"],
    answer:
      "You can choose from beach resorts, hotels in town and village homestays. Book ahead for weekends, festivals and mango season. MTDC resorts are also an option.",
  },
  {
    keys: ["rule", "rules", "safety", "safe", "guidelines", "litter", "dress", "dos", "donts"],
    answer:
      "Respect local customs, never litter, follow safety signs at beaches, forts and waterfalls, carry a valid ID, and don't feed or disturb wildlife.",
  },
  {
    keys: ["trek", "trekking", "waterfall", "waterfalls", "hike", "marleshwar"],
    answer:
      "Marleshwar waterfall near Sangameshwar and the forest trails around the Sahyadri foothills are popular, mostly in and after monsoon. Go with a local guide, avoid rocky areas when wet, and never swim in fast water.",
  },
  {
    keys: ["emergency", "helpline", "police", "ambulance", "contact", "help"],
    answer:
      "In an emergency, call 112 (India's emergency number). For tourist information, check the MTDC website listed in the Official References section.",
  },
  {
    keys: ["itinerary", "plan", "days", "weekend", "trip", "schedule"],
    answer:
      "A 2-day idea:\nDay 1: Ratnadurg Fort, Bhatye beach, sunset at the lighthouse area.\nDay 2: Ganpatipule temple and beach, then Aare-Ware viewpoint on the way back.\nAdd a day for Guhagar, Velneshwar or Dapoli if you have time.",
    actions: [{ label: "Open Interactive Map", route: "/map" }],
  },
  {
    keys: ["map", "location", "nearby", "near me", "where"],
    answer: "The Interactive Map shows places and services around Ratnagiri.",
    actions: [{ label: "Open Interactive Map", route: "/map" }],
  },
  {
    keys: ["contribute", "register", "add my", "list my", "business", "service provider"],
    answer: "You can add a location or service through the Contribute form.",
    actions: [{ label: "Open Contribute form", route: "/registration" }],
  },
];

/* ---------- Page matching from your own menus ---------- */
function flatten(items, out = []) {
  items.forEach((i) => {
    if (i.route) out.push({ label: i.label, route: i.route });
    if (i.children?.length) flatten(i.children, out);
  });
  return out;
}
const PAGES = flatten(MENUS);

function matchPages(text) {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 4)
    .map((t) => t.replace(/s$/, ""));
  if (!tokens.length) return [];
  return PAGES.map((p) => ({
    ...p,
    score: tokens.filter((t) => p.label.toLowerCase().includes(t)).length,
  }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ label, route }) => ({ label: `Open ${label}`, route }));
}

const hasKey = (text, key) =>
  new RegExp(`(^|[^a-z])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(text);

function localReply(raw) {
  const text = raw.toLowerCase();
  let best = null;
  let bestScore = 0;
  KB.forEach((entry) => {
    const score = entry.keys.filter((k) => hasKey(text, k)).length;
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  });

  const pages = matchPages(raw);
  if (best) {
    const actions = [...(best.actions || [])];
    pages.forEach((p) => {
      if (!actions.some((a) => a.route === p.route)) actions.push(p);
    });
    return { text: best.answer, actions: actions.slice(0, 3) };
  }

  return {
    text: pages.length
      ? "These pages may help:"
      : "I can help with places to visit, beaches, forts, food, stays, getting here and travel rules. Try one of the quick questions below.",
    actions: pages,
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Component ---------- */
export default function ChatBot({ apiUrl = "", position = "bottom-right", lift = false }) {
  const navigate = useNavigate();
  // position: "bottom-right" (default) or "bottom-left".
  // lift: raise the chat button so it sits above another corner button (e.g. BackToTop).
  const left = position === "bottom-left";
  const launcherPos = `${lift ? "bottom-24" : "bottom-5"} ${
    left ? "left-4 sm:left-6" : "right-4 sm:right-6"
  }`;
  const panelPos = `${lift ? "sm:bottom-44" : "sm:bottom-24"} ${
    left ? "sm:left-6" : "sm:right-6"
  }`;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {
      /* ignore */
    }
    return [GREETING];
  });
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ block: "end" });
      inputRef.current?.focus();
    }
  }, [open, messages, typing]);

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || typing) return;
    const next = [...messages, { id: uid(), role: "user", text }];
    setMessages(next);
    setInput("");
    setTyping(true);

    let reply = null;
    if (apiUrl) {
      try {
        const history = next
          .filter((m, i) => !(i === 0 && m.role === "bot"))
          .slice(-12)
          .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            reply = {
              text: data.reply,
              actions: data.actions?.length ? data.actions : matchPages(`${text} ${data.reply}`),
            };
          }
        }
      } catch {
        /* fall back to built-in answers */
      }
    }
    if (!reply) {
      await sleep(450 + Math.random() * 350);
      reply = localReply(text);
    }

    setMessages((m) => [...m, { id: uid(), role: "bot", ...reply }]);
    setTyping(false);
  };

  const go = (route) => {
    navigate(route);
    if (window.innerWidth < 640) setOpen(false);
  };

  const reset = () => {
    setMessages([GREETING]);
    setTyping(false);
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className={`fixed ${launcherPos} z-50 h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-[#0b3149] text-white shadow-xl shadow-slate-900/30 ring-4 ring-white/80 transition-transform hover:scale-105 active:scale-95 ${
          open ? "hidden sm:flex" : "flex"
        }`}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Ratnagiri guide chat"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className={`fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-white shadow-2xl sm:inset-auto ${panelPos} sm:h-[34rem] sm:max-h-[calc(100vh-9rem)] sm:w-[23.5rem] sm:rounded-3xl sm:border sm:border-slate-200`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#082638] via-[#0b3149] to-[#0f5f5c] px-4 py-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] text-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Compass size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold leading-tight">Ratnagiri Guide</p>
              <p className="truncate text-xs text-teal-100">Places, food, stays and travel tips</p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="Start a new chat"
              title="New chat"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
            >
              <RotateCcw size={17} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 px-4 py-4"
          >
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex flex-col items-start"}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-teal-700 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {m.text}
                </div>
                {m.actions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a) => (
                      <button
                        key={a.route + a.label}
                        type="button"
                        onClick={() => go(a.route)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-teal-600/30 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 hover:bg-teal-100"
                      >
                        <MapPin size={14} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3" aria-label="Typing">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick questions */}
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={typing}
                className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-teal-500 hover:text-teal-800 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-slate-100 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                placeholder="Ask about Ratnagiri"
                aria-label="Your message"
                className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white hover:bg-teal-800 disabled:bg-slate-300"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              General guidance only. Check official sources before you travel.
            </p>
          </form>
        </div>
      )}
    </>
  );
}