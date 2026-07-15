import { UtensilsCrossed, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TraditionalFood() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="bg-orange-600 text-white py-12 text-center">

          <UtensilsCrossed
            size={60}
            className="mx-auto mb-4"
          />

          <h1 className="text-4xl font-bold">
            Traditional Food
          </h1>

        </div>

        <div className="p-10">

          <p className="text-lg text-slate-700 leading-8">

            Ratnagiri is famous for its authentic Konkani cuisine,
            fresh seafood, Alphonso mangoes, kokum products,
            traditional sweets and locally prepared delicacies.
            This section will introduce visitors to the rich food
            culture of the Konkan region.

          </p>

          <div className="mt-10 p-6 rounded-xl bg-orange-50 border border-orange-200">

            <h2 className="text-2xl font-semibold text-orange-700">

              🍽 Content Coming Soon

            </h2>

            <p className="mt-3 text-slate-700">

              Information regarding traditional dishes,
              local restaurants, village food experiences,
              seasonal specialties and culinary trails
              will be added after approval from the project guide.

            </p>

          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-10 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >

            <ArrowLeft size={20} />

            Back to Dashboard

          </button>

        </div>

      </div>

    </div>
  );
}