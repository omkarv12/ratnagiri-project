// src/config/navMenus.js

/* ------------------------------------------------------------------ */
/*  Helpers for the Explore mega menu                                  */
/* ------------------------------------------------------------------ */

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// One Explore category: its places, then a "View all" link.
// Place routes are placeholders (/explore/<category>/<place>): change them
// to your real routes when those pages exist.
const exploreCategory = (key, label, places) => ({
  label,
  route: `/explore/${key}`,
  children: [
    ...places.map((p) => ({ label: p, route: `/explore/${key}/${slug(p)}` })),
    { label: `View all ${label}`, route: `/explore/${key}` },
  ],
});

/* ------------------------------------------------------------------ */
/*  1. Explore: Ratnagiri places, grouped like the MP Tourism menu     */
/* ------------------------------------------------------------------ */

export const EXPLORE_MENU = {
  label: "Explore",
  route: "/about/geography/places",
  children: [
    exploreCategory("nature", "Nature", [
      "Ganpatipule Beach",
      "Aare-Ware Beach",
      "Bhatye Beach",
      "Guhagar Beach",
      "Kelshi Beach",
      "Anjarle Beach",
      "Murud-Karde Beach",
      "Marleshwar Waterfall",
    ]),
    exploreCategory("heritage", "Heritage", [
      "Ratnadurg Fort",
      "Jaigad Fort",
      "Purnagad Fort",
      "Suvarnadurg Fort",
      "Thibaw Palace",
      "Lokmanya Tilak Birthplace",
      "Patit Pavan Mandir",
      "Konkan Petroglyphs",
    ]),
    exploreCategory("wildlife", "Wildlife", [
      "Velas Turtle Conservation",
      "Anjarle Turtle Nesting",
      "Kelshi Turtle Nesting",
      "Karde Dolphin Safari",
      "Creek Birdwatching",
      "Mangrove Safari",
    ]),
    exploreCategory("spirituality", "Spirituality", [
      "Ganpatipule Ganesh Temple",
      "Marleshwar Temple",
      "Velneshwar Temple",
      "Parshuram Temple",
      "Dashabhuja Ganesh Temple",
      "Ratnadurg Bhagwati Temple",
      "Karneshwar Temple",
      "Pawas Swami Swaroopanand",
    ]),
  ],
};

/* ------------------------------------------------------------------ */
/*  2. Experiences                                                     */
/* ------------------------------------------------------------------ */

export const EXPERIENCES_MENU = {
  label: "Experiences",
  route: "/dashboard#experiences",
  children: [
    // No Adventure page yet: placeholder route.
    { label: "Adventure", route: "/experiences/adventure" },
    { label: "Culture", route: "/about/culture" },
    { label: "Festivals and Events", route: "/experiences/upcoming-events" },
    { label: "Rural Tourism Experiences", route: "/experiences/explore-villages" },
    { label: "Hidden Paths", route: "/experiences/hidden-paths" },
    { label: "Circuits", route: "/experiences/circuits" },
  ],
};

/* ------------------------------------------------------------------ */
/*  3. Plan Your Trip                                                  */
/* ------------------------------------------------------------------ */

export const PLAN_MENU = {
  label: "Plan Your Trip",
  route: "/plan-your-trip",
  children: [
    // No Hotels / Tourist Guides / Travel Agents / Travel Handbook pages yet:
    // placeholder routes.
    { label: "Accommodations - Hotels", route: "/plan-your-trip/hotels" },
    { label: "Accommodations - Homestays", route: "/experiences/discover-your-stay" },
    { label: "Itineraries", route: "/experiences/itineraries" },
    { label: "Tourist Guides", route: "/plan-your-trip/tourist-guides" },
    { label: "Travel Agents", route: "/plan-your-trip/travel-agents" },
    { label: "Travel Handbook", route: "/plan-your-trip/travel-handbook" },
  ],
};

/* ------------------------------------------------------------------ */
/*  4. Blogs (the existing Stories pages)                              */
/*     Reading Stories → /stories                                      */
/*     Video Stories   → the Videos block on the dashboard             */
/*     Reels           → /stories/reels                                */
/* ------------------------------------------------------------------ */

export const BLOGS_MENU = {
  label: "Blogs",
  route: "/stories",
  children: [
    { label: "Read Stories", route: "/stories" },
    { label: "Video Stories", route: "/dashboard#stories" },
    { label: "Reels", route: "/stories/reels" },
  ],
};

/* ------------------------------------------------------------------ */
/*  5. Resources, with About Us as a sub-menu inside it                */
/*     (About Us opens a flyout with its four pages)                   */
/* ------------------------------------------------------------------ */

export const ABOUT_US_MENU = {
  label: "About Us",
  children: [
    { label: "Society", route: "/society" },
    { label: "Economy", route: "/economy" },
    { label: "Culture", route: "/about/culture" },
    { label: "Governance", route: "/good-governance" },
  ],
};

export const RESOURCES_MENU = {
  label: "Resources",
  route: "/resources",
  children: [
    ABOUT_US_MENU,
    { label: "Medical Facilities", route: "/medical-facilities" },
    { label: "Police Stations", route: "/police-stations" },
    { label: "Transport Facilities", route: "/resources/transport-facilities" },
    { label: "Do's / Don'ts", route: "/resources/dos-and-donts" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Kept only so files that still import these don't break.            */
/*  Neither is in MENUS below, so they don't show in the nav.          */
/* ------------------------------------------------------------------ */

export const STORIES_MENU = BLOGS_MENU;

export const GEOGRAPHY_MENU = {
  label: "Geography",
  route: "/about/geography/places",
  children: [
    { label: "Places", route: "/about/geography/places" },
    { label: "Hidden Paths", route: "/experiences/hidden-paths" },
    { label: "Explore Villages", route: "/experiences/explore-villages" },
    { label: "Itineraries", route: "/experiences/itineraries" },
    { label: "Circuits", route: "/experiences/circuits" },
  ],
};

/* ------------------------------------------------------------------ */
/*  The header, sidebar and search use this list, in this order.       */
/*  (DashboardLayout adds "Home" first unless NAV_ITEMS = MENUS.)      */
/* ------------------------------------------------------------------ */

export const MENUS = [EXPLORE_MENU, EXPERIENCES_MENU, PLAN_MENU, BLOGS_MENU, RESOURCES_MENU];