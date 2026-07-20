import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import placeholderImage from '../assets/placeholder.png';
import API_BASE_URL from "../config";
import InfoCard from "../components/profile/InfoCard";
import InfoRow from "../components/profile/InfoRow";
import ChipList from "../components/profile/ChipList";

// Convert a Google Drive "open?id=" link into a directly-viewable image URL
function driveIdToImageUrl(link) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
}

// Parses a comma-separated string of Drive links into an array of {url} objects
function parseDrivePhotoField(field) {
  if (!field) return [];
  return field
    .split(",")
    .map((link) => link.trim())
    .filter(Boolean)
    .map((link) => ({ url: driveIdToImageUrl(link) }))
    .filter((p) => p.url);
}

export default function ProfileDetails({ loc, type, onBack, compact = false }) {

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {

    if (!loc) return;

    if (type === "eco" || type === "driver" || type === "busstop") {
      setPhotos([]);
      return;
    }

    const loadPhotos = async () => {

      if (!loc?.name && !loc?.location_name) return;

      try {

        setLoadingPhotos(true);

        const response = await fetch(
          `${API_BASE_URL}/api/location-photos/${encodeURIComponent(loc.location_name || loc.name)}`
        );

        const data = await response.json();

        if (data.success) {
          setPhotos(data.photos || []);
        } else {
          setPhotos([]);
        }

      } catch (err) {

        console.error(err);
        setPhotos([]);

      } finally {

        setLoadingPhotos(false);

      }

    };

    loadPhotos();

  }, [type, loc?.id, loc?.name, loc?.location_name]);

  const extraPhotos = useMemo(() => {
    if (!loc) return [];
    if (type === "homestay") return parseDrivePhotoField(loc.amenities_photos);
    if (type === "driver") return parseDrivePhotoField(loc.vehiclePhotos);
    return parseDrivePhotoField(loc.site_photos);
  }, [loc, type]);

  const galleryPhotos = [...photos.slice(1), ...extraPhotos];

  const heroImages = photos.length > 0 ? photos.map((p) => p.url) : [placeholderImage];

  useEffect(() => {
    setHeroSlide(0);
  }, [loc?.id]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (!loc) return null;

  const heroHeight = compact ? "h-56" : "h-[420px]";
  const nameSize = compact ? "text-2xl" : "text-5xl";

  return (
    <div className={compact ? "" : "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500"}>

      {/* HEADER SECTION */}
      <div
        className={`sticky top-0 z-20 relative ${heroHeight} text-white overflow-hidden ${compact ? "rounded-xl" : ""}`}
      >

        {heroImages.map((url, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${url})`,
              opacity: index === heroSlide ? 1 : 0,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-black/45"></div>

        {heroImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setHeroSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === heroSlide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        <div className={`relative z-10 flex flex-col justify-between h-full ${compact ? "p-4" : "p-8"}`}>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-orange-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              {compact ? "Close" : "Back to Directory"}
            </button>
          )}

          <div className={compact ? "" : "flex items-end justify-between"}>

            <div>

              <div className="flex items-center gap-3 mb-2">

                <span className="px-3 py-1 bg-orange-500/80 rounded-full text-xs font-bold uppercase tracking-wider">
                  {type === "homestay" ? "Homestay" : type === "eco" ? "Eco Unit" : type === "driver" ? (loc.vehicleType || "Driver") : type === "busstop" ? "Bus Stand" : loc.category}
                </span>

                {!compact && (
                  <span className="flex items-center gap-1 text-white/90 text-sm">
                    <MapPin size={14} />
                    {type === "busstop" ? (
                      loc.taluka_name || loc.taluka
                    ) : type === "eco" ? (
                      loc.village_name || loc.village
                    ) : (
                      <>{loc.village_name || loc.village}, {loc.taluka_name || loc.taluka}</>
                    )}
                  </span>
                )}

              </div>

              <h1 className={`${nameSize} font-bold drop-shadow-lg`}>
                {loc.location_name || loc.name}
              </h1>

              {type === "homestay" && (
                <p className="text-white/90 mt-1 text-sm">
                  Hosted by {loc.owner}
                </p>
              )}

            </div>

            {!compact && (
              <div className="text-right">
                <div className="text-sm text-white/80">ID Ref</div>
                <div className="text-3xl font-bold">#{loc.id.toString().padStart(4, "0")}</div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CONTENT SECTION */}
      <div className={compact ? "py-6" : "p-8"}>
        <div className="space-y-6">

          {type === "village" && (
            <>
              <InfoCard title="Basic Information">
                <InfoRow label="Location Name" value={loc.location_name || loc.name} />
                <InfoRow label="Village" value={loc.village_name || loc.village} />
                <InfoRow label="Taluka" value={loc.taluka_name || loc.taluka} />
                <InfoRow label="District" value={loc.district_name} />
                <InfoRow label="Located In" value={loc.located_in} />
                <InfoRow label="Owned By" value={loc.owned_by} />
                <InfoRow label="Managed By" value={loc.managed_by} />
                <InfoRow label="Nearest Landmark" value={loc.nearest_landmark || loc.landmark} />
                <InfoRow label="Nearest Bus Stand" value={loc.nearest_bus_stand} />
                <InfoRow label="Nearest Railway Station" value={loc.nearest_railway_station} />

                {loc.google_maps_link && (
                  <div className="flex justify-between gap-6">
                    <span className="font-semibold text-slate-600">Google Maps</span>
                    <a href={loc.google_maps_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Open Location
                    </a>
                  </div>
                )}
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

              <div>
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6">Database Coordinates</h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Verified Location</div>
                      <div className="text-sm text-slate-500">Coordinates actively mapped</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase">Latitude</div>
                      <div className="font-mono text-lg text-slate-700">{loc.lat.toFixed(4)}° N</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase">Longitude</div>
                      <div className="font-mono text-lg text-slate-700">{loc.lng.toFixed(4)}° E</div>
                    </div>
                  </div>
                </div>
              </div>

              <InfoCard title="Visitor Facilities">
                <ChipList title="Amenities Available" values={loc.amenities_available} />
                <InfoRow label="Site Activities" value={loc.site_activities} />
                <InfoRow label="Amenities" value="Open Space Parking" />
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

              <InfoCard title="Suggestions">
                <div className="text-slate-700 whitespace-pre-line">
                  {loc.suggestions_improvements || "No suggestions available."}
                </div>
              </InfoCard>
            </>
          )}

          {type === "homestay" && (
            <>
              <InfoCard title="Basic Information">
                <InfoRow label="Homestay Name" value={loc.homestay_name} />
                <InfoRow label="Owner" value={loc.owner_name} />
                <InfoRow label="Phone Number" value={loc.phone_number} />
                <InfoRow label="Situated In" value={loc.situated_in} />
                <InfoRow label="Village / Town / City" value={loc.village_town_city} />
                <InfoRow label="Taluka" value={loc.taluka_name} />
                <InfoRow label="District" value={loc.district_name} />
                <InfoRow label="Live on Premises" value={loc.live_on_premises} />
                <InfoRow label="Homestay Type" value={loc.homestay_type} />
                <InfoRow label="Unit Type" value={loc.unit_type} />
                <InfoRow label="Registered with MTDC" value={loc.registered_mtdc} />
                <InfoRow label="Discoverable on Google Maps" value={loc.discoverable_google_map} />

                {loc.google_map_link && (
                  <div className="flex justify-between gap-6">
                    <span className="font-semibold text-slate-600">Google Maps</span>
                    <a href={loc.google_map_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Open Location
                    </a>
                  </div>
                )}
              </InfoCard>

              <InfoCard title="Booking & Pricing">
                <InfoRow label="How Tourists Can Book" value={loc.accept_bookings} />
                <InfoRow label="Booking App Used" value={loc.booking_app} />
                <InfoRow label="Listed on Booking.com / Airbnb" value={loc.listed_booking_airbnb} />
                <InfoRow label="Digital Payments (UPI)" value={loc.digital_payments_upi} />
                <InfoRow label="Cancellation Policy" value={loc.cancellation_policy} />

                {loc.photo_price_list && (
                  <div className="flex justify-between gap-6">
                    <span className="font-semibold text-slate-600">Price List</span>
                    <a href={loc.photo_price_list} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      View Price List
                    </a>
                  </div>
                )}
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

              <InfoCard title="Contact & Social">
                {loc.social_media_page && loc.social_media_page !== "No" && (
                  <div className="flex justify-between gap-6">
                    <span className="font-semibold text-slate-600">Social Media</span>
                    <a href={loc.social_media_page} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      View Page
                    </a>
                  </div>
                )}
                <InfoRow label="Submitted On" value={loc.submission_timestamp} />
              </InfoCard>
            </>
          )}

          {type === "driver" && (
            <>
              <InfoCard title="Driver Information">
                <InfoRow label="Driver Name" value={loc.name || loc.driver_name} />
                <InfoRow label="Phone Number" value={loc.phone} />
                <InfoRow label="Base Village" value={loc.village} />
                <InfoRow label="Taluka" value={loc.taluka} />
              </InfoCard>

              <InfoCard title="Vehicle & Service">
                <InfoRow label="Vehicle Type" value={loc.vehicleType} />
                <InfoRow label="Vehicle Number" value={loc.vehicleNumber} />
                <InfoRow label="Service Area" value={loc.serviceArea} />
                <InfoRow label="Per Day Rate" value={loc.rate} />
              </InfoCard>

              {loc.phone && (
                <InfoCard title="Contact">
                  <div className="flex justify-between gap-6">
                    <span className="font-semibold text-slate-600">Call Driver</span>
                    <a href={`tel:${loc.phone.split('/')[0].trim()}`} className="text-blue-600 hover:underline">
                      {loc.phone}
                    </a>
                  </div>
                </InfoCard>
              )}
            </>
          )}

          {type === "busstop" && (
            <>
              <InfoCard title="Bus Stand Information">
                <InfoRow label="Stop Name" value={loc.name} />
                <InfoRow label="Taluka" value={loc.taluka} />
                <InfoRow label="District" value={loc.district} />

                {loc.googleMapsLink && (
                  <div className="flex justify-between gap-6">
                    <span className="font-semibold text-slate-600">Google Maps</span>
                    <a href={loc.googleMapsLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Open Location
                    </a>
                  </div>
                )}
              </InfoCard>

              <InfoCard title="Timetable">
                {loc.timetableLink ? (
                  <a
                    href={loc.timetableLink}
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

        </div>

        {/* PHOTO GALLERY */}
        {type !== "busstop" && (
        <div className="mt-10">
          <div className="border-t border-slate-200 pt-8">
            <h2 className={`${compact ? "text-lg" : "text-2xl"} font-bold text-slate-800 mb-6`}>
              {type === 'homestay' ? 'Property Gallery' : type === 'eco' ? 'Facility Gallery' : type === 'driver' ? 'Vehicle Photo Gallery' : 'Site Photo Gallery'}
            </h2>
            <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
              {loadingPhotos ? (
                <div className="col-span-full text-center py-8">Loading photos...</div>
              ) : galleryPhotos.length > 0 ? (
                galleryPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-slate-500 py-10">
                  No additional site photographs available.
                </div>
              )}
            </div>
          </div>
        </div>
        )}

      </div>

      {lightboxIndex !== null && galleryPhotos[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          onTouchStart={(e) => {
            e.currentTarget.dataset.touchStartX = e.changedTouches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const startX = parseFloat(e.currentTarget.dataset.touchStartX || "0");
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;
            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryPhotos.length - 1));
              } else {
                setLightboxIndex((prev) => (prev < galleryPhotos.length - 1 ? prev + 1 : 0));
              }
            }
          }}
          className="fixed inset-0 bg-black/90 z-2000 flex items-center justify-center cursor-zoom-out p-6"
        >
          <img
            src={galleryPhotos[lightboxIndex].url}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white text-3xl font-bold hover:text-orange-400"
          >
            &times;
          </button>

          {galleryPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryPhotos.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-orange-400 bg-black/30 hover:bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev < galleryPhotos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-orange-400 bg-black/30 hover:bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                &#8250;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}