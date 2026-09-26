// src/components/BackToTop.jsx
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`rt-cta fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#C2410C] via-[#B4532A] to-[#9A3412] text-white shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <span className="rt-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
      <ArrowUp size={18} className="relative" />
    </button>
  );
}