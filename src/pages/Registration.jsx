import RegistrationForm from "../components/forms/RegistrationForm";

export default function Registration() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">

      <style>{`
        @keyframes reg-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reg-fade-up { animation: reg-fade-up 0.5s ease-out both; }
        .reg-fade-up-delay-1 { animation-delay: 0.08s; }
        .reg-fade-up-delay-2 { animation-delay: 0.16s; }
        .reg-fade-up-delay-3 { animation-delay: 0.24s; }

        @keyframes reg-underline {
          from { width: 0; }
          to { width: 64px; }
        }
        .reg-underline {
          animation: reg-underline 0.6s ease-out 0.3s both;
        }
      `}</style>

      <div className="mb-10 text-center">

        <p className="reg-fade-up text-orange-700 text-base sm:text-lg font-medium tracking-wide">
          अतिथि देवो भवः
        </p>
        <p className="reg-fade-up reg-fade-up-delay-1 text-black text-xs mt-1">
          "The guest is akin to God" — welcome to Ratnagiri
        </p>

        <h1 className="reg-fade-up reg-fade-up-delay-2 text-4xl font-bold text-slate-800 mt-4">
          Registration
        </h1>

        <div className="reg-underline h-1 bg-orange-600 rounded-full mx-auto mt-3" />

        <p className="reg-fade-up reg-fade-up-delay-3 text-slate-600 mt-4 max-w-xl mx-auto">
          Register a Tourism Location, Homestay, or Driver Service with Ratnagiri Tourism.
        </p>

      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 transition-shadow duration-300 hover:shadow-xl">

        <RegistrationForm />

      </div>

    </div>
  );
}