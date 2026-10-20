import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, MapPin, Phone, Navigation, X, ChevronLeft, ChevronRight } from "lucide-react";
import placeholderImage from "../assets/placeholder.png";
import API_BASE_URL from "../config";
import InfoCard from "../components/profile/InfoCard";
import InfoRow from "../components/profile/InfoRow";
import ChipList from "../components/profile/ChipList";
import WeatherWidget from "../components/profile/WeatherWidget";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Google Drive link -> directly viewable image URL.
function driveIdToImageUrl(link) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
}

// Comma-separated string of Drive / Cloudinary links -> [{ url }]
function parseDrivePhotoField(field) {
  if (!field) return [];
  return String(field)
    .split(",")
    .map((link) => link.trim())
    .filter(Boolean)
    .map((link) => {
      const isDirectImageUrl =
        /^https?:\/\/res\.cloudinary\.com\//.test(link) ||
        /\.(jpe?g|png|webp|gif)$/i.test(link);
      return { url: isDirectImageUrl ? link : driveIdToImageUrl(link) };
    })
    .filter((p) => p.url);
}

// Submitted links are user-provided: only ever allow http(s) in an href.
function safeUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const firstPhone = (p) => (p || "").split("/")[0].trim();

// Fetches the Drive folder photos for a place (village / homestay) by name.
function useLocationPhotos(loc, type) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const name = loc?.location_name || loc?.name || loc?.homestay_name;
  const id = loc?.id;
  // Bus stops and ATMs carry a single direct photo URL instead of a Drive folder.
  const singlePhoto = loc?.photo_url;

  useEffect(() => {
    setPhotos([]);
    setLoading(false);
    if (!loc) return;

    if (type === "eco" || type === "driver") return;
    if (type === "busstop" || type === "atm") {
      setPhotos(singlePhoto ? [{ url: singlePhoto }] : []);
      return;
    }
    if (!name) return;

    // Ignore the response if the user opened a different place meanwhile.
    let cancelled = false;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/location-photos/${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPhotos(data.success ? data.photos || [] : []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id, name, singlePhoto]);

  return { photos, loading };
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

// A "label ........ link" row that only renders for safe http(s) links.
function LinkRow({ label, href, text }) {
  const url = safeUrl(href);
  if (!url) return null;
  return (
    <div className="flex justify-between gap-6">
      <span className="font-semibold text-slate-600">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
        {text}
      </a>
    </div>
  );
}

function ActionLink({ href, icon, children, className }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${className}`}
    >
      {icon}
      {children}
    </a>
  );
}

function Lightbox({ photos, index, onClose, onChange, title }) {
  const touchStartX = useRef(0);
  const count = photos.length;

  const prev = () => onChange((index - 1 + count) % count);
  const next = () => onChange((index + 1) % count);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange((index - 1 + count) % count);
      if (e.key === "ArrowRight") onChange((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onChange]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50 && count > 1) (diff > 0 ? prev : next)();
      }}
      className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center cursor-zoom-out p-6"
    >
      <img
        src={photos[index].url}
        alt={`${title} photo ${index + 1}`}
        className="max-w-full max-h-full rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
      >
        <X size={22} />
      </button>

      {count > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRight size={28} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {index + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProfileDetails({ loc, type, onBack, compact = false }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [failedUrls, setFailedUrls] = useState(() => new Set());

  const { photos, loading: loadingPhotos } = useLocationPhotos(loc, type);

  const extraPhotos = useMemo(() => {
    if (!loc) return [];
    if (type === "homestay") return parseDrivePhotoField(loc.amenities_photos);
    if (type === "driver") return parseDrivePhotoField(loc.vehiclePhotos || loc.vehicle_photos);
    return parseDrivePhotoField(loc.site_photos);
  }, [loc, type]);

  // Merge, drop duplicates and any image that failed to load.
  const galleryPhotos = useMemo(() => {
    const seen = new Set();
    return [...photos, ...extraPhotos].filter((p) => {
      if (!p?.url || failedUrls.has(p.url) || seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    });
  }, [photos, extraPhotos, failedUrls]);

  const heroImages = useMemo(
    () => (galleryPhotos.length > 0 ? galleryPhotos.map((p) => p.url) : [placeholderImage]),
    [galleryPhotos]
  );

  // New place -> start over.
  useEffect(() => {
    setHeroSlide(0);
    setLightboxIndex(null);
    setFailedUrls(new Set());
  }, [loc?.id, type]);

  // Auto-rotate the hero, unless the viewer prefers reduced motion.
  useEffect(() => {
    if (heroImages.length <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Keep the slide index valid if the image list shrinks.
  useEffect(() => {
    if (heroSlide >= heroImages.length) setHeroSlide(0);
  }, [heroImages.length, heroSlide]);

  if (!loc) return null;

  // ---- Normalised fields (the data comes from different tables) -------------

  const title = loc.location_name || loc.name || loc.homestay_name || "Untitled";
  const lat = toNum(loc.lat ?? loc.latitude);
  const lng = toNum(loc.lng ?? loc.longitude);
  const hasCoords = lat !== null && lng !== null;
  const phone = loc.phone || loc.phone_number;
  const phoneFirst = firstPhone(phone);
  const whatsappDigits = phoneFirst.replace(/\D/g, "").slice(-10);
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : null;

  const badge =
    type === "homestay" ? "Homestay"
    : type === "eco" ? "Eco Unit"
    : type === "driver" ? (loc.vehicleType || "Driver")
    : type === "busstop" ? "Bus Stand"
    : type === "atm" ? "ATM"
    : loc.category;

  const villageTalukaLine = [
    loc.village_name || loc.village || loc.village_town_city,
    loc.taluka_name || loc.taluka,
  ]
    .filter(Boolean)
    .join(", ");

  const placeLine =
    type === "busstop"
      ? loc.taluka_name || loc.taluka
      : type === "eco"
        ? loc.village_name || loc.village
        : villageTalukaLine; // villages, homestays and ATMs

  const galleryTitle =
    type === "homestay" ? "Property Gallery"
    : type === "eco" ? "Facility Gallery"
    : type === "driver" ? "Vehicle Photo Gallery"
    : "Site Photo Gallery";

  // ATM hours / cash deposit may arrive parsed (is24x7) or raw (is_24x7).
  const atmIs24x7 = (loc.is24x7 ?? loc.is_24x7) !== false;
  const atmCashDeposit = !!(loc.hasCashDeposit ?? loc.has_cash_deposit);

  const heroHeight = compact ? "h-56" : "h-[420px]";
  const nameSize = compact ? "text-2xl" : "text-5xl";
  const showActions = !!(phoneFirst || directionsUrl);

  return (
    <div className={compact ? "" : "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500"}>

      {/* In the side panel the hero scrolls away, so keep a close button in reach. */}
      {compact && onBack && (
        <div className="sticky top-0 z-30 h-0">
          <button
            onClick={onBack}
            aria-label="Close details"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/55 text-white shadow-md hover:bg-black/75 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* HERO */}
      <div className={`relative ${heroHeight} text-white overflow-hidden ${compact ? "rounded-xl" : ""}`}>
        {heroImages.map((url, index) => (
          <div
            key={url}
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url("${url}")`,
              opacity: index === heroSlide ? 1 : 0,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-black/45" />

        {heroImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setHeroSlide(index)}
                aria-label={`Show photo ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === heroSlide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        <div className={`relative z-10 flex flex-col ${compact ? "justify-end" : "justify-between"} h-full ${compact ? "p-4" : "p-8"}`}>
          {!compact && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 self-start text-white hover:text-orange-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to Directory
            </button>
          )}

          <div className={compact ? "" : "flex items-end justify-between"}>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {badge && (
                  <span className="px-3 py-1 bg-orange-500/80 rounded-full text-xs font-bold uppercase tracking-wider">
                    {badge}
                  </span>
                )}
                {!compact && placeLine && (
                  <span className="flex items-center gap-1 text-white/90 text-sm">
                    <MapPin size={14} />
                    {placeLine}
                  </span>
                )}
              </div>

              <h1 className={`${nameSize} font-bold drop-shadow-lg`}>{title}</h1>

              {type === "homestay" && (loc.owner || loc.owner_name) && (
                <p className="text-white/90 mt-1 text-sm">Hosted by {loc.owner || loc.owner_name}</p>
              )}
              {type === "atm" && (loc.bank || loc.bank_name) && (
                <p className="text-white/90 mt-1 text-sm">{loc.bank || loc.bank_name}</p>
              )}
            </div>

            {!compact && loc.id != null && (
              <div className="text-right">
                <div className="text-sm text-white/80">ID Ref</div>
                <div className="text-3xl font-bold">#{String(loc.id).padStart(4, "0")}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={compact ? "py-6" : "p-8"}>

        {/* Quick actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 mb-6">
            {directionsUrl && (
              <ActionLink
                href={directionsUrl}
                icon={<Navigation size={15} />}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Directions
              </ActionLink>
            )}
            {phoneFirst && (
              <ActionLink
                href={`tel:${phoneFirst}`}
                icon={<Phone size={15} />}
                className="bg-slate-100 text-slate-800 hover:bg-slate-200"
              >
                Call
              </ActionLink>
            )}
            {whatsappDigits.length === 10 && (
              <ActionLink
                href={`https://wa.me/91${whatsappDigits}`}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                WhatsApp
              </ActionLink>
            )}
          </div>
        )}

        <div className="space-y-6">

          {type === "village" && (
            <>
              <InfoCard title="Basic Information">
                <InfoRow label="Location Name" value={title} />
                <InfoRow label="Village" value={loc.village_name || loc.village} />
                <InfoRow label="Taluka" value={loc.taluka_name || loc.taluka} />
                <InfoRow label="District" value={loc.district_name} />
                <InfoRow label="Located In" value={loc.located_in} />
                <InfoRow label="Owned By" value={loc.owned_by} />
                <InfoRow label="Managed By" value={loc.managed_by} />
                <InfoRow label="Nearest Landmark" value={loc.nearest_landmark || loc.landmark} />
                <InfoRow label="Nearest Bus Stand" value={loc.nearest_bus_stand} />
                <InfoRow label="Nearest Railway Station" value={loc.nearest_railway_station} />
                <LinkRow label="Google Maps" href={loc.google_maps_link} text="Open Location" />
              </InfoCard>

              <InfoCard title="Tourism Information">
                <InfoRow label="Attraction Type" value={loc.attraction_type} />
                <InfoRow label="Visiting Hours" value={loc.visiting_hours} />
                <InfoRow label="Peak Period" value={loc.peak_period} />
                <InfoRow label="Seasonal Availability" value={loc.seasonal_availability} />
                <InfoRow label="Average Time Spent" value={loc.avg_time_spent || loc.duration} />
                <InfoRow label="Road Condition" value={loc.road_condition || loc.roadStatus} />
                <InfoRow label="Crowd Level" value={loc.crowd_level} />
              </InfoCard>

              {hasCoords && (
                <InfoCard title="Weather">
                  <WeatherWidget lat={lat} lng={lng} />
                </InfoCard>
              )}

              {hasCoords && (
                <InfoCard title="Location on Map">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-500">Latitude</div>
                      <div className="font-mono text-lg text-slate-700">{lat.toFixed(4)}° N</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500">Longitude</div>
                      <div className="font-mono text-lg text-slate-700">{lng.toFixed(4)}° E</div>
                    </div>
                  </div>
                </InfoCard>
              )}

              <InfoCard title="Visitor Facilities">
                <ChipList title="Amenities Available" values={loc.amenities_available} />
                <InfoRow label="Site Activities" value={loc.site_activities} />
                <InfoRow label="Parking" value={loc.parking_space} />
                <InfoRow label="Food Stalls" value={loc.food_stalls} />
                <InfoRow label="Public Transport" value={loc.public_transport} />
                <InfoRow label="Signboards" value={loc.signboards_available} />
                <InfoRow label="Entry Fee" value={loc.entry_fee} />
                <InfoRow label="Entry Fee Amount" value={loc.entry_fee_amount} />
              </InfoCard>

              <InfoCard title="Community & Regulations">
                <InfoRow label="Formal Regulations" value={loc.formal_regulations} />
                <InfoRow label="Local Residents Involved" value={loc.local_residents_involved} />
                <InfoRow label="Job Type" value={loc.job_type} />
                <InfoRow label="Description" value={loc.user_description} />
              </InfoCard>

              {loc.suggestions_improvements && (
                <InfoCard title="Suggestions">
                  <div className="text-slate-700 whitespace-pre-line">{loc.suggestions_improvements}</div>
                </InfoCard>
              )}
            </>
          )}

          {type === "homestay" && (
            <>
              <InfoCard title="Basic Information">
                <InfoRow label="Homestay Name" value={loc.homestay_name || loc.name} />
                <InfoRow label="Owner" value={loc.owner_name || loc.owner} />
                <InfoRow label="Phone Number" value={phone} />
                <InfoRow label="Situated In" value={loc.situated_in} />
                <InfoRow label="Village / Town / City" value={loc.village_town_city || loc.village} />
                <InfoRow label="Taluka" value={loc.taluka_name || loc.taluka} />
                <InfoRow label="District" value={loc.district_name} />
                <InfoRow label="Live on Premises" value={loc.live_on_premises} />
                <InfoRow label="Homestay Type" value={loc.homestay_type || loc.type} />
                <InfoRow label="Unit Type" value={loc.unit_type} />
                <InfoRow label="Registered with MTDC" value={loc.registered_mtdc} />
                <InfoRow label="Discoverable on Google Maps" value={loc.discoverable_google_map} />
                <LinkRow label="Google Maps" href={loc.google_map_link} text="Open Location" />
              </InfoCard>

              {hasCoords && (
                <InfoCard title="Weather">
                  <WeatherWidget lat={lat} lng={lng} />
                </InfoCard>
              )}

              <InfoCard title="Booking & Pricing">
                <InfoRow label="How Tourists Can Book" value={loc.accept_bookings} />
                <InfoRow label="Booking App Used" value={loc.booking_app} />
                <InfoRow label="Listed on Booking.com / Airbnb" value={loc.listed_booking_airbnb} />
                <InfoRow label="Digital Payments (UPI)" value={loc.digital_payments_upi} />
                <InfoRow label="Cancellation Policy" value={loc.cancellation_policy} />
                <LinkRow label="Price List" href={loc.photo_price_list} text="View Price List" />
              </InfoCard>

              <InfoCard title="Amenities & Meals">
                <ChipList title="Facilities & Services" values={loc.facilities_services} />
                <InfoRow label="Vegetarian Meals" value={loc.veg_meals} />
                <InfoRow label="Non-Vegetarian Meals" value={loc.both_veg_nonveg} />
              </InfoCard>

              <InfoCard title="Local Experiences & Guidance">
                <InfoRow label="Nearby Tourist Attractions" value={loc.tourist_attractions} />
                <InfoRow label="Guidance Provided to Reach Places" value={loc.guidance_provided} />
                <InfoRow label="Guides Available" value={loc.guides_available} />
                <InfoRow label="Local Experiences Offered" value={loc.local_experiences} />
              </InfoCard>

              {safeUrl(loc.social_media_page) && (
                <InfoCard title="Social">
                  <LinkRow label="Social Media" href={loc.social_media_page} text="View Page" />
                </InfoCard>
              )}
            </>
          )}

          {type === "driver" && (
            <>
              <InfoCard title="Driver Information">
                <InfoRow label="Driver Name" value={loc.name || loc.driver_name} />
                <InfoRow label="Phone Number" value={phone} />
                <InfoRow label="Base Village" value={loc.village || loc.base_village} />
                <InfoRow label="Taluka" value={loc.taluka || loc.taluka_name} />
              </InfoCard>

              <InfoCard title="Vehicle & Service">
                <InfoRow label="Vehicle Type" value={loc.vehicleType || loc.vehicle_type} />
                <InfoRow label="Vehicle Number" value={loc.vehicleNumber || loc.vehicle_number} />
                <InfoRow label="Service Area" value={loc.serviceArea || loc.service_area} />
                <InfoRow label="Per Day Rate" value={loc.rate ?? loc.per_day_rate} />
              </InfoCard>
            </>
          )}

          {type === "busstop" && (
            <>
              <InfoCard title="Bus Stand Information">
                <InfoRow label="Stop Name" value={loc.name || loc.stop_name} />
                <InfoRow label="Taluka" value={loc.taluka || loc.taluka_name} />
                <InfoRow label="District" value={loc.district || loc.district_name} />
                <LinkRow
                  label="Google Maps"
                  href={loc.googleMapsLink || loc.google_maps_link}
                  text="Open Location"
                />
              </InfoCard>

              <InfoCard title="Timetable">
                {safeUrl(loc.timetableLink || loc.timetable_link) ? (
                  <a
                    href={safeUrl(loc.timetableLink || loc.timetable_link)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 py-2 px-4 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-lg transition-colors"
                  >
                    ⬇ Download bus timetable
                  </a>
                ) : (
                  <div className="text-slate-500 text-sm">No timetable uploaded yet for this bus stand.</div>
                )}
              </InfoCard>
            </>
          )}

          {type === "atm" && (
            <InfoCard title="ATM Information">
              <InfoRow label="ATM Name" value={loc.name || loc.atm_name} />
              <InfoRow label="Bank" value={loc.bank || loc.bank_name} />
              <InfoRow label="Village" value={loc.village || loc.village_name} />
              <InfoRow label="Taluka" value={loc.taluka || loc.taluka_name} />
              <InfoRow label="District" value={loc.district || loc.district_name} />
              <InfoRow label="Address" value={loc.address} />
              <InfoRow label="Hours" value={atmIs24x7 ? "24x7" : "Limited hours"} />
              <InfoRow label="Cash Deposit" value={atmCashDeposit ? "Available" : "Not available"} />
              <LinkRow
                label="Google Maps"
                href={loc.googleMapsLink || loc.google_maps_link}
                text="Open Location"
              />
            </InfoCard>
          )}

        </div>

        {/* PHOTO GALLERY (bus stops and ATMs only have a single hero photo) */}
        {type !== "busstop" && type !== "atm" && (
          <div className="mt-10">
            <div className="border-t border-slate-200 pt-8">
              <h2 className={`${compact ? "text-lg" : "text-2xl"} font-bold text-slate-800 mb-6`}>
                {galleryTitle}
              </h2>
              <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                {loadingPhotos && galleryPhotos.length === 0 ? (
                  <div className="col-span-full text-center text-slate-500 py-8">Loading photos…</div>
                ) : galleryPhotos.length > 0 ? (
                  galleryPhotos.map((photo, idx) => (
                    <button
                      key={photo.url}
                      onClick={() => setLightboxIndex(idx)}
                      aria-label={`Open photo ${idx + 1} of ${galleryPhotos.length}`}
                      className="rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer"
                    >
                      <img
                        src={photo.url}
                        alt={`${title} photo ${idx + 1}`}
                        loading="lazy"
                        onError={() =>
                          setFailedUrls((prev) => new Set(prev).add(photo.url))
                        }
                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center text-slate-500 py-10">
                    No photos available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && galleryPhotos[lightboxIndex] && (
        <Lightbox
          photos={galleryPhotos}
          index={lightboxIndex}
          title={title}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </div>
  );
}