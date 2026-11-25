import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import API_BASE_URL from "../config";
// Same photo the Experiences section uses. Change to any image in src/assets.
import LoginBg from "../assets/Experience-Bg.jpg";

/*
  Admin login. The sign-in logic is unchanged:
    Google credential -> POST /api/auth/google -> login(data) -> /admin
  Only the look is new, and the two blocking alert() popups are replaced by
  messages shown inside the card.
*/

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSuccess = async (credentialResponse) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (data.success) {
        login(data);
        navigate("/admin");
      } else {
        setError(data.error || "Access denied.");
        setBusy(false);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f5f3f0] lg:grid-cols-[1.1fr_1fr]">
      <style>{`
        @keyframes lg-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .lg-rise { animation: lg-rise .7s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .lg-rise { animation: none; } }
      `}</style>

      {/* ---------- left: photo panel ---------- */}
      <div
        className="relative flex min-h-[220px] flex-col justify-between overflow-hidden p-8 text-white sm:p-12 lg:min-h-screen"
        style={{
          backgroundImage: `linear-gradient(160deg, rgba(74,10,18,0.88), rgba(139,10,58,0.62) 55%, rgba(26,5,7,0.82)), url(${LoginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Link
          to="/dashboard"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:text-[#e8a13a]"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to website
        </Link>

        <div className="lg-rise mt-10 lg:mt-0">
          <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#e8a13a]">
            <span className="h-px w-10 bg-[#e8a13a]" /> Konkan, Maharashtra
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Ratnagiri
            <br />
            Tourism
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Manage places, homestays, events and stories for the district, all in one place.
          </p>
        </div>

        <p className="hidden text-xs uppercase tracking-[0.25em] text-white/50 lg:block">
          Admin dashboard
        </p>
      </div>

      {/* ---------- right: login card ---------- */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="lg-rise w-full max-w-[420px] border border-black/5 bg-white p-8 shadow-[0_24px_60px_-24px_rgba(74,10,18,0.35)] sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8b0a3a] to-[#c4103f] text-white shadow-md">
            <Lock size={24} aria-hidden="true" />
          </span>

          <h2 className="mt-6 font-display text-3xl font-semibold text-[#4a0a12]">Admin Login</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Sign in with your authorised Google account to open the dashboard.
          </p>

          <div className="my-7 h-px w-full bg-gradient-to-r from-[#e8a13a] to-transparent" />

          {busy ? (
            <div className="flex items-center gap-3 text-sm font-medium text-[#4a0a12]" role="status">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#8b0a3a]/25 border-t-[#8b0a3a]" />
              Signing you in...
            </div>
          ) : (
            <div className="flex justify-start">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError("Google login failed. Please try again.")}
                theme="outline"
                size="large"
                shape="rectangular"
                text="signin_with"
                width="300"
              />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 border-l-4 border-[#c4103f] bg-[#fff1f3] px-4 py-3 text-sm font-medium text-[#8b0a3a]"
            >
              {error}
            </p>
          )}

          <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#8b0a3a]" aria-hidden="true" />
            Access is limited to staff whose email is registered. If you cannot sign in, contact the site administrator.
          </p>
        </div>
      </div>
    </div>
  );
}