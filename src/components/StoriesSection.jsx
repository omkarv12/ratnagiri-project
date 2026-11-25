import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import API_BASE_URL from "../config";

/*
  OUR STORIES — blog cards in a slider (3 on desktop, 2 on tablet, 1 on phone).
  Data: GET /api/blogs?limit=8  (published stories, newest first)
  Click a card -> /stories/<slug>. "View all stories" -> /stories.
*/

const STORIES_ROUTE = "/stories";
const IMG_H = 320; // card photo height in px (arrows sit on its bottom edge)
const ARROW = 60;  // arrow button size in px

export default function StoriesSection() {
  const navigate = useNavigate();
  const track = useRef(null);
  const [stories, setStories] = useState([]);
  const [state, setState] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/blogs?limit=8&page=1`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load stories"))))
      .then((d) => {
        if (cancelled) return;
        setStories(Array.isArray(d?.blogs) ? d.blogs : []);
        setState("ok");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const slide = (dir) => {
    const el = track.current;
    if (!el || !el.firstElementChild) return;
    const step = el.firstElementChild.getBoundingClientRect().width + 24; // card + gap
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="stories" className="scroll-mt-24 bg-[#f0ede8] px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
      <style>{`
        .ss-track { scrollbar-width: none; -ms-overflow-style: none; }
        .ss-track::-webkit-scrollbar { display: none; }
      `}</style>

      <h2 className="text-center font-display text-3xl font-semibold uppercase tracking-[0.3em] text-[#4a0a12] sm:text-4xl">
        Our Stories
      </h2>

      <div className="mx-auto mt-10 max-w-[1400px] sm:mt-14">
        {state === "loading" && (
          <div className="grid gap-6 md:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <div className="animate-pulse bg-black/10" style={{ height: IMG_H }} />
                <div className="h-6 w-4/5 animate-pulse bg-black/10" />
                <div className="h-4 w-full animate-pulse bg-black/10" />
              </div>
            ))}
          </div>
        )}

        {state === "error" && (
          <p className="py-12 text-center text-sm text-red-600">Couldn't load stories right now. Please try again later.</p>
        )}

        {state === "ok" && stories.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">No stories published yet.</p>
        )}

        {state === "ok" && stories.length > 0 && (
          <div className="relative">
            <div ref={track} className="ss-track flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth">
              {stories.map((s) => (
                <article
                  key={s.slug}
                  className="group w-[88%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                >
                  <button
                    onClick={() => navigate(`/stories/${s.slug}`)}
                    className="block w-full text-left"
                    aria-label={`Read story: ${s.title}`}
                  >
                    <div className="relative overflow-hidden bg-[#2a0608]" style={{ height: IMG_H }}>
                      {s.cover_image && (
                        <img
                          src={s.cover_image}
                          alt=""
                          loading="lazy"
                          draggable={false}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="px-4 pb-2 pt-5">
                      <h3 className="line-clamp-3 font-display text-2xl font-semibold leading-tight text-[#4a0a12] sm:text-[1.7rem]">
                        {s.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[#2a0608]/80">
                        {s.excerpt || "Read the full story to find out more."}
                      </p>
                      <span className="mt-4 inline-block text-sm font-bold uppercase tracking-[0.12em] text-[#e03a55] group-hover:underline">
                        Learn more
                      </span>
                    </div>
                  </button>
                </article>
              ))}
            </div>

            {stories.length > 1 && (
              <>
                <button
                  onClick={() => slide(-1)}
                  aria-label="Previous stories"
                  className="absolute left-0 flex items-center justify-center bg-white text-slate-500 shadow-md transition hover:bg-slate-100"
                  style={{ top: IMG_H - ARROW, width: ARROW, height: ARROW }}
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={() => slide(1)}
                  aria-label="Next stories"
                  className="absolute right-0 flex items-center justify-center bg-[#e03a55] text-white shadow-md transition hover:brightness-110"
                  style={{ top: IMG_H - ARROW, width: ARROW, height: ARROW }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        )}

        {state === "ok" && stories.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate(STORIES_ROUTE)}
              className="border border-[#4a0a12] px-8 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#4a0a12] transition hover:bg-[#4a0a12] hover:text-white"
            >
              View all stories
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
