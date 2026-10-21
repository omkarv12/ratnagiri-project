import { useNavigate } from "react-router-dom";
import { BedDouble, MapPin, ShieldCheck } from "lucide-react";
import { useLocations } from "../context/LocationsContext";

function driveThumb(link, width = 600) {
  if (!link) return null;
  const match = link.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w${width}` : null;
}

export default function DiscoverYourStay() {
  const { homestays, loading } = useLocations();
  const navigate = useNavigate();

  if (loading) return <p className="p-8 text-slate-500">Loading stays…</p>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Discover Your Stay</h1>
      <p className="mb-8 text-slate-600">
        Authentic homestays across Ratnagiri, hosted by local families.
      </p>

      {homestays.length === 0 ? (
        <p className="rounded bg-slate-100 p-4 text-center text-slate-500">
          No homestays added yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homestays.map((home) => {
            const img = driveThumb(home.photo_homestay);
            return (
              <article
                key={home.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {img ? (
                  <img src={img} alt={home.name} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-amber-50">
                    <BedDouble className="text-amber-500" size={36} />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="mb-1 flex items-center gap-2 font-bold text-slate-800">
                    {home.name} <ShieldCheck size={14} className="text-emerald-500" />
                  </h2>
                  <p className="mb-2 flex items-center gap-1 text-sm text-slate-600">
                    <MapPin size={13} />
                    {[home.village, home.taluka].filter(Boolean).join(", ")}
                  </p>
                  {home.type && (
                    <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                      {home.type}
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/profile/homestay/${home.id}`)}
                    className="mt-4 w-full rounded bg-amber-500 py-2 text-sm font-bold text-slate-900 hover:bg-amber-600"
                  >
                    View details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}