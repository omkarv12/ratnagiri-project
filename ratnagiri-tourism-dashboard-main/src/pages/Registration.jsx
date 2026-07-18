import RegistrationForm from "../components/forms/RegistrationForm";

export default function Registration() {
  return (
    <div className="max-w-5xl mx-auto py-10">

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-slate-800">
          Registration
        </h1>

        <p className="text-slate-600 mt-3">
          Register a Tourism Location or Homestay with Ratnagiri Tourism.
        </p>

      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">

        <RegistrationForm />

      </div>

    </div>
  );
}