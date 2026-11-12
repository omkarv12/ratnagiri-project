// src/config/navMenus.js

// "About Us" sits right after Home and holds the four district pages.
export const ABOUT_US_MENU = {
  label: "About Us",
  children: [
    { label: "Society", route: "/society" },
    { label: "Economy", route: "/economy" },
    { label: "Culture", route: "/about/culture" },
    { label: "Governance", route: "/good-governance" },
  ],
};

// "Geography" is a sub-menu inside Plan Your Trip. Hovering it opens a
// flyout with these pages. Routes are unchanged, so existing links keep working.
const GEOGRAPHY_SUBMENU = {
  label: "Geography",
  children: [
    { label: "Places", route: "/about/geography/places" },
    { label: "Hidden Paths", route: "/experiences/hidden-paths" },
    { label: "Explore Villages", route: "/experiences/explore-villages" },
    { label: "Itineraries", route: "/experiences/itineraries" },
    { label: "Circuits", route: "/experiences/circuits" },
  ],
};

export const PLAN_MENU = {
  label: "Plan Your Trip",
  route: "/plan-your-trip",
  children: [
    { label: "Plan Your Trip", route: "/plan-your-trip" },
    // The interactive map page lives at /map (see App.jsx).
    { label: "Plan Your Trip – Interactive Map", route: "/map" },
    GEOGRAPHY_SUBMENU,
  ],
};

export const EXPERIENCES_MENU = {
  label: "Experiences",
  route: "/dashboard#experiences",
  children: [
    { label: "Upcoming Events", route: "/experiences/upcoming-events" },
    { label: "Discover Your Stay", route: "/experiences/discover-your-stay" },
  ],
};

// Stories has three sub-pages:
//  - Reading Stories → /stories (Stories.jsx, the full list of written stories)
//  - Video Stories   → the Videos block on the dashboard
//  - Reels           → /stories/reels
export const STORIES_MENU = {
  label: "Stories",
  route: "/stories",
  children: [
    { label: "Reading Stories", route: "/stories" },
    { label: "Video Stories", route: "/dashboard#stories" },
    { label: "Reels", route: "/stories/reels" },
  ],
};

// Own top-level menu (no longer nested under "About").
export const RESOURCES_MENU = {
  label: "Resources",
  route: "/resources",
  children: [
    { label: "Medical Facilities", route: "/medical-facilities" },
    { label: "Police Stations", route: "/police-stations" },
    { label: "Transport Facilities", route: "/resources/transport-facilities" },
    { label: "Do's / Don'ts", route: "/resources/dos-and-donts" },
  ],
};

// Kept only so any file that still imports GEOGRAPHY_MENU doesn't break.
// It is NOT in MENUS below, so it no longer shows as its own top-level menu.
export const GEOGRAPHY_MENU = {
  label: "Geography",
  route: "/about/geography/places",
  children: GEOGRAPHY_SUBMENU.children,
};

// DashboardLayout puts "Home" first, then these in order:
// Home → About Us → Plan Your Trip → Experiences → Stories → Resources
export const MENUS = [
  ABOUT_US_MENU,
  PLAN_MENU,
  EXPERIENCES_MENU,
  STORIES_MENU,
  RESOURCES_MENU,
];