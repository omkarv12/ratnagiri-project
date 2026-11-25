import { Link } from "react-router-dom";
import { Landmark, Lock, Mail, MapPin, Phone } from "lucide-react";
// Dark background photo (same file the Experiences section uses). Shown faintly.
import FooterBg from "../assets/Experience-Bg.jpg";

/*
  RATNAGIRI TOURISM FOOTER (same layout idea as the reference screenshot)

  EDIT HERE
  - LOGO:    import your logo (e.g. import Logo from "../assets/logo.png") and set LOGO = Logo.
             Until then a text badge is shown in the crimson panel.
  - CONTACT: every "TODO" value below is a placeholder. Put your real
             phone, email, office hours and address.
  - LINKS:   QUICK_LINKS routes already match your App.jsx routes.
  - SOCIAL:  put your real page links.

  Place it once, in DashboardLayout, below the page content:
      <Outlet />
      <Footer />
*/

const LOGO = null; // e.g. Logo

// Where the "Admin Login" button goes. /admin is protected, so a visitor who is
// not logged in is sent to the login page. Use "/login" to always open the login page.
const ADMIN_ROUTE = "/admin";

const CONTACT = {
  phone: "TODO: 1800-XXX-XXXX",
  hours: [
    "Monday to Saturday (10:00 AM to 6:00 PM)",
    "Sunday and public holidays - Closed",
  ],
  email: "TODO: info@ratnagiritourism.in",
  address: [
    "TODO: Tourism Office, Building / Road,",
    "Near Landmark,",
    "Ratnagiri, Maharashtra 415612",
  ],
};

// These national numbers are real. Change only if you want different ones.
const HELPLINES = [
  { label: "Emergency", number: "112" },
  { label: "Police", number: "100" },
  { label: "Ambulance", number: "108" },
  { label: "Incredible India Tourist Infoline (24x7, toll free)", number: "1800-11-1363" },
];

const QUICK_LINKS = [
  [
    { label: "Explore Destinations", to: "/about/geography/places" },
    { label: "Homestays & Hotels", to: "/experiences/discover-your-stay" },
    { label: "Festivals and Events", to: "/experiences/upcoming-events" },
    { label: "Culture", to: "/about/culture" },
    { label: "Adventure & Hidden Paths", to: "/experiences/hidden-paths" },
    { label: "Explore Villages", to: "/experiences/explore-villages" },
    { label: "Plan Your Trip", to: "/plan-your-trip" },
    { label: "Interactive Map", to: "/map" },
    { label: "Contribute a place", to: "/registration" },
  ],
  [
    { label: "Itineraries", to: "/experiences/itineraries" },
    { label: "Circuits", to: "/experiences/circuits" },
    { label: "Guided Walks", to: "/experiences/guided-walks" },
    { label: "Konkani Food", to: "/experiences/konkani-food" },
    { label: "Stories", to: "/stories" },
    { label: "Videos", to: "/videos" },
    { label: "Reel Awards", to: "/stories/reels" },
    { label: "Do's and Don'ts", to: "/resources/dos-and-donts" },
    { label: "Transport Facilities", to: "/resources/transport-facilities" },
    { label: "Medical Facilities", to: "/medical-facilities" },
    { label: "Police Stations", to: "/police-stations" },
  ],
];

const ABOUT_LINKS = [
  { label: "Society", to: "/society" },
  { label: "Economy", to: "/economy" },
  { label: "Good Governance", to: "/good-governance" },
];

/* ---- social icons (lucide no longer ships brand icons) ---- */
const svg = (children, fill = false) => (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={fill ? "currentColor" : "none"}
    stroke={fill ? "none" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const FacebookIcon = svg(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />);
const XIcon = svg(<path d="M18.9 2H22l-7.6 8.7L23.5 22H16.9l-5.2-6.8L5.7 22H2.6l8.1-9.3L1.5 2h6.8l4.7 6.2zm-1.2 18h1.7L7.4 4H5.6z" />, true);
const InstagramIcon = svg(
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>
);
const YoutubeIcon = svg(
  <>
    <path d="M2.5 17a24 24 0 0 1 0-10 4 4 0 0 1 2.9-2.8C7.7 3.8 12 3.8 12 3.8s4.3 0 6.6.4A4 4 0 0 1 21.5 7a24 24 0 0 1 0 10 4 4 0 0 1-2.9 2.8c-2.3.4-6.6.4-6.6.4s-4.3 0-6.6-.4A4 4 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </>
);
const LinkedinIcon = svg(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>
);

const SOCIAL = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon }, // TODO: your page
  { label: "X (Twitter)", href: "https://x.com", Icon: XIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedinIcon },
];

const linkCls =
  "block py-2 text-[15px] leading-snug text-white/85 transition hover:text-[#e8a13a] hover:underline underline-offset-4";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{
        backgroundColor: "#2d0a0e",
        backgroundImage: `linear-gradient(rgba(45,10,14,0.93), rgba(45,10,14,0.93)), url(${FooterBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col lg:flex-row">
        {/* ---------- crimson logo panel ---------- */}
        <div className="flex shrink-0 items-start justify-center bg-gradient-to-b from-[#8b0a3a] to-[#c4103f] px-6 py-8 lg:min-h-[528px] lg:w-[294px]">
          <Link to="/dashboard" aria-label="Ratnagiri Tourism home" className="flex flex-col items-center text-center">
            {LOGO ? (
              <img src={LOGO} alt="Ratnagiri Tourism" className="h-28 w-auto" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 shadow-inner">
                <Landmark size={40} aria-hidden="true" />
              </span>
            )}
            <span className="mt-4 font-display text-2xl font-semibold leading-tight">Ratnagiri Tourism</span>
            <span className="mt-1 text-sm italic text-white/85">Konkan, Maharashtra</span>
          </Link>
        </div>

        {/* ---------- columns ---------- */}
        <div className="grid flex-1 gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.55fr_1.1fr_0.9fr] lg:gap-12 lg:px-16">
          {/* Quick links */}
          <div>
            <h3 className="mb-3 font-display text-xl font-semibold">Quick Links</h3>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {QUICK_LINKS.map((col, i) => (
                <ul key={i}>
                  {col.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className={linkCls}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  {i === 1 &&
                    ABOUT_LINKS.map((l) => (
                      <li key={l.to}>
                        <Link to={l.to} className={linkCls}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Help & support */}
          <div>
            <h3 className="mb-3 font-display text-xl font-semibold">Help &amp; Support</h3>
            <div className="space-y-4 text-[15px] leading-relaxed text-white/85">
              <p className="flex items-start gap-2">
                <Phone size={16} className="mt-1 shrink-0 text-[#e8a13a]" aria-hidden="true" />
                <span>{CONTACT.phone}</span>
              </p>
              <div>
                {CONTACT.hours.map((h) => (
                  <p key={h}>{h}</p>
                ))}
              </div>
              <p className="flex items-start gap-2">
                <Mail size={16} className="mt-1 shrink-0 text-[#e8a13a]" aria-hidden="true" />
                <span className="break-all">
                  For feedback &amp; suggestions mail us at: <br />
                  <a href={`mailto:${CONTACT.email.replace(/^TODO:\s*/, "")}`} className="hover:text-[#e8a13a] hover:underline">
                    {CONTACT.email}
                  </a>
                </span>
              </p>
              <ul className="space-y-1">
                {HELPLINES.map((h) => (
                  <li key={h.label}>
                    {h.label}:{" "}
                    <a href={`tel:${h.number.replace(/[^\d+]/g, "")}`} className="font-semibold text-white hover:text-[#e8a13a]">
                      {h.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2d0a0e] transition hover:-translate-y-1 hover:bg-[#e8a13a]"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="mb-3 font-display text-xl font-semibold">Address</h3>
            <p className="flex items-start gap-2 text-[15px] leading-8 text-white/85">
              <MapPin size={16} className="mt-2 shrink-0 text-[#e8a13a]" aria-hidden="true" />
              <span>
                {CONTACT.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ---------- bottom line ---------- */}
      <div className="border-t border-white/10 px-6 py-6 text-center text-sm text-white/80">
        &copy; {year} Ratnagiri Tourism. All Rights Reserved.
        <span className="mx-3 text-white/40" aria-hidden="true">|</span>
        <Link to="/disclaimer" className="hover:text-[#e8a13a] hover:underline">Disclaimer</Link>
        <span className="mx-3 text-white/40" aria-hidden="true">|</span>
        <Link to="/privacy-policy" className="hover:text-[#e8a13a] hover:underline">Privacy Policy</Link>
        <Link
          to={ADMIN_ROUTE}
          className="mt-4 inline-flex items-center gap-1.5 border border-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-[#e8a13a] hover:text-[#e8a13a] sm:ml-6 sm:mt-0"
        >
          <Lock size={13} aria-hidden="true" /> Admin Login
        </Link>
      </div>
    </footer>
  );
}