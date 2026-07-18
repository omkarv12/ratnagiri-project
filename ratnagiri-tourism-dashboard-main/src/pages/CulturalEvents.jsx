import { Drama, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CulturalEvents() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="bg-purple-700 text-white py-12 text-center">

          <Drama
            size={60}
            className="mx-auto mb-4"
          />

          <h1 className="text-4xl font-bold">
            Cultural Events
          </h1>

        </div>

        <div className="p-10">

          <p className="text-lg text-slate-700 leading-8">

            Ratnagiri is home to a vibrant cultural heritage
            celebrated through traditional festivals, temple fairs,
            folk dances, local music, theatre performances and
            centuries-old Konkan traditions. This section will
            showcase the district's rich cultural events and
            celebrations.

          </p>

          <div className="mt-10 p-6 rounded-xl bg-purple-50 border border-purple-200">

            <h2 className="text-2xl font-semibold text-purple-700">

              🎭 Content Coming Soon

            </h2>

            <p className="mt-3 text-slate-700">

              Detailed information about festivals,
              annual cultural programs, traditional arts,
              folk performances and local celebrations
              will be added after approval from the
              project guide.

            </p>

          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-10 flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >

            <ArrowLeft size={20} />

            Back to Dashboard

          </button>

        </div>

      </div>

    </div>
  );
}