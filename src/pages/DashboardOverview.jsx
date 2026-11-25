import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLocations } from "../context/LocationsContext";
// Cinematic loading screen (needs RatnagiriLoader.jsx in the same folder)
import RatnagiriCinematic from "../components/RatnagiriCinematic";
// Hero: plain video with Beaches / Forts / Temples / Nature tabs
import HeroVideoTabs from "../components/HeroVideoTabs";
// Experiences: photo-tile mosaic
import ExperiencesMosaic from "../components/ExperiencesMosaic";
// Festivals & Events: featured event panel + poster slider
import FestivalsEvents from "../components/FestivalsEvents";
// Videos: big YouTube player + playlist
import VideosSection from "../components/VideosSection";
// Our Stories: blog slider
import StoriesSection from "../components/StoriesSection";
// Social Feeds: Instagram reels grid
import SocialFeeds from "../components/SocialFeeds";
// Footer (shown at the bottom of the home page)
import Footer from "../components/Footer";
// NOTE: HowDidYouHearModal is mounted once in App.jsx, not here.

/*
  PAGE ORDER
    1. Hero (video + tabs)
    2. Experiences
    3. Festivals & Events
    4. Videos
    5. Our Stories
    6. Social Feeds
    7. Footer

  The old "Stories & Videos" 3-in-1 block and the "About" block (Society /
  Economy / Good Governance) were removed from this page. Those pages still
  exist at /society, /economy and /good-governance.

  Colours come from the palette tokens in DashboardLayout's THEME_CSS.
*/

// The loading scene always plays at least this long (ms), even when the data
// arrives faster. Set to 0 to show the loader only while data is loading.
const MIN_LOADER_MS = 0;

export default function DashboardOverview() {
  const { loading } = useLocations();
  const location = useLocation();

  // Arrived with a #section-id (e.g. /dashboard#experiences)? Scroll to it.
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [location]);

  // Keeps the cinematic loader on screen for a minimum time.
  const [minTimeDone, setMinTimeDone] = useState(MIN_LOADER_MS === 0);
  useEffect(() => {
    if (MIN_LOADER_MS === 0) return undefined;
    const t = setTimeout(() => setMinTimeDone(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minTimeDone) return <RatnagiriCinematic />;

  return (
    <div className="font-body animate-in fade-in duration-500">
      <HeroVideoTabs />
      <ExperiencesMosaic />
      <FestivalsEvents />
      <VideosSection />
      <StoriesSection />
      <SocialFeeds />
      <Footer />
    </div>
  );
}