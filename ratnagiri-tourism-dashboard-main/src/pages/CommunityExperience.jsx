import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommunityExperience() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="bg-blue-700 text-white py-12 text-center">

          <Users
            size={60}
            className="mx-auto mb-4"
          />

          <h1 className="text-4xl font-bold">
            Community Experience
          </h1>

        </div>

        <div className="p-10">

          <p className="text-lg text-slate-700 leading-8">

            Experience authentic village life in Ratnagiri by
            interacting with local communities, artisans,
            fishermen, farmers and self-help groups.
            Visitors can gain insights into the region's
            traditions, livelihoods and sustainable
            rural tourism initiatives.

          </p>

          <div className="mt-10 p-6 rounded-xl bg-blue-50 border border-blue-200">

            <h2 className="text-2xl font-semibold text-blue-700">

              🤝 Content Coming Soon

            </h2>

            <p className="mt-3 text-slate-700">

              Information on village tourism,
              community-based activities,
              handicrafts, local workshops,
              cultural interactions and rural
              experiences will be added after
              approval from the project guide.

            </p>

          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-10 flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >

            <ArrowLeft size={20} />

            Back to Dashboard

          </button>

        </div>

      </div>

    </div>
  );
}

