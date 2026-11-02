// src/config/navMenus.js

// Top-level pages that used to sit under About. They now appear directly
// after Home in the header, in this order.
export const SOCIETY_MENU = { label: "Society", route: "/society" };
export const ECONOMY_MENU = { label: "Economy", route: "/economy" };
export const CULTURE_MENU = { label: "Culture", route: "/about/culture" };
export const GOVERNANCE_MENU = { label: "Governance", route: "/good-governance" };

export const PLAN_MENU = {
  label: "Plan Your Trip",
  route: "/plan-your-trip",
  children: [
    { label: "Plan Your Trip", route: "/plan-your-trip" },
    // The interactive map page lives at /map (see App.jsx).
    { label: "Plan Your Trip – Interactive Map", route: "/map" },
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

export const STORIES_MENU = {
  label: "Stories",
  route: "/dashboard#stories",
  children: [
    { label: "Videos", route: "/dashboard#stories" },
    { label: "Reels", route: "/stories/reels" },
  ],
};

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

// About now only holds Geography and its sub-pages.
export const ABOUT_MENU = {
  label: "About",
  route: "/dashboard#about",
  children: [
    {
      label: "Geography",
      children: [
        { label: "Places", route: "/about/geography/places" },
        { label: "Hidden Paths", route: "/experiences/hidden-paths" },
        { label: "Explore Villages", route: "/experiences/explore-villages" },
        { label: "Itineraries", route: "/experiences/itineraries" },
        { label: "Circuits", route: "/experiences/circuits" },
      ],
    },
  ],
};

// DashboardLayout puts "Home" first, then these in order:
// Home → Society → Economy → Culture → Governance → Plan Your Trip →
// Experiences → Stories → Resources → About (Geography only, last).
export const MENUS = [
  SOCIETY_MENU,
  ECONOMY_MENU,
  CULTURE_MENU,
  GOVERNANCE_MENU,
  PLAN_MENU,
  EXPERIENCES_MENU,
  STORIES_MENU,
  RESOURCES_MENU,
  ABOUT_MENU,
];