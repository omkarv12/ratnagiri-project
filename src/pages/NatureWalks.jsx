import { Trees, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NatureWalks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="bg-green-700 text-white py-12 text-center">

          <Trees size={60} className="mx-auto mb-4" />

          <h1 className="text-4xl font-bold">
            Nature Walks
          </h1>

        </div>

        <div className="p-10">

          <p className="text-lg text-slate-700 leading-8">

            Ratnagiri offers beautiful trekking routes,
            forest trails, waterfalls and coastal landscapes.
            This section will showcase nature-based tourism
            experiences across the district.

          </p>

          <div className="mt-10 p-6 rounded-xl bg-green-50 border border-green-200">

            <h2 className="text-2xl font-semibold text-green-700">

              🚧 Content Coming Soon

            </h2>

            <p className="mt-3 text-slate-700">

              Detailed information will be added after
              approval from the project guide.

            </p>

          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-10 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

        </div>

      </div>

    </div>
  );
}