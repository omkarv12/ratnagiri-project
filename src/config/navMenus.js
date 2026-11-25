// Navigation for Visit Ratnagiri.
// Used by the header, the sidebar and the Ctrl/⌘ K search.
//
// ROUTES are placeholders built from the label, e.g.
//   /explore/nature/ganpatipule-beach
// Change them to match the routes you actually have in your router.
// PLACES are my suggestions for Ratnagiri district; add, remove or rename freely.

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const place = (category, label) => ({
  label,
  route: `/explore/${category}/${slug(label)}`,
});

const category = (key, label, places) => ({
  label,
  route: `/explore/${key}`,
  children: [
    ...places.map((p) => place(key, p)),
    { label: `View all ${label}`, route: `/explore/${key}` },
  ],
});

export const MENUS = [
  {
    label: "Explore",
    route: "/explore",
    children: [
      category("nature", "Nature", [
        "Ganpatipule Beach",
        "Aare-Ware Beach",
        "Bhatye Beach",
        "Guhagar Beach",
        "Kelshi Beach",
        "Anjarle Beach",
        "Murud-Karde Beach",
        "Marleshwar Waterfall",
      ]),
      category("heritage", "Heritage", [
        "Ratnadurg Fort",
        "Jaigad Fort",
        "Purnagad Fort",
        "Suvarnadurg Fort",
        "Thibaw Palace",
        "Lokmanya Tilak Birthplace",
        "Patit Pavan Mandir",
        "Konkan Petroglyphs",
      ]),
      category("wildlife", "Wildlife", [
        "Velas Turtle Conservation",
        "Anjarle Turtle Nesting",
        "Kelshi Turtle Nesting",
        "Karde Dolphin Safari",
        "Creek Birdwatching",
        "Mangrove Safari",
      ]),
      category("spirituality", "Spirituality", [
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
  },
  {
    label: "Experiences",
    route: "/experiences",
    children: [
      { label: "Adventure", route: "/experiences/adventure" },
      { label: "Culture", route: "/experiences/culture" },
      { label: "Festivals and Events", route: "/experiences/festivals-and-events" },
      { label: "Rural Tourism Experiences", route: "/experiences/rural-tourism" },
    ],
  },
  {
    label: "Plan Your Trip",
    route: "/plan-your-trip",
    children: [
      { label: "Accommodations - Hotels", route: "/plan-your-trip/hotels" },
      { label: "Accommodations - Homestays", route: "/plan-your-trip/homestays" },
      { label: "Itineraries", route: "/plan-your-trip/itineraries" },
      { label: "Tourist Guides", route: "/plan-your-trip/tourist-guides" },
      { label: "Travel Agents", route: "/plan-your-trip/travel-agents" },
      { label: "Travel Handbook", route: "/plan-your-trip/travel-handbook" },
    ],
  },
  {
    label: "Blogs",
    route: "/blogs",
  },
];