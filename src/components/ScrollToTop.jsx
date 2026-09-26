import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Agar URL mein #section-id hai (jaise /dashboard#about), to us hash
    // wale logic ko chhodo — wahan pehle se hi smooth-scroll handle ho raha hai.
    if (hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}