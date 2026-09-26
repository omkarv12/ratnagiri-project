// src/config/navMenus.js
export const PLAN_MENU = {
  label: "Plan Your Trip",
  route: "/plan-your-trip",
  children: [
    { label: "Plan Your Trip", route: "/plan-your-trip" },
    { label: "Plan Your Trip – Interactive Map", route: "/interactive-map" },
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

export const ABOUT_MENU = {
  label: "About",
  route: "/dashboard#about",
  children: [
    {
      label: "About",
      children: [
        { label: "Society", route: "/society" },
        { label: "Economy", route: "/economy" },
        { label: "Culture", route: "/about/culture" },
        { label: "Governance", route: "/good-governance" },
      ],
    },
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

export const MENUS = [PLAN_MENU, EXPERIENCES_MENU, STORIES_MENU, RESOURCES_MENU, ABOUT_MENU];