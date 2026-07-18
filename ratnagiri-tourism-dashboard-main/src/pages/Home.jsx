import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
      <div className="text-center space-y-8 p-8 md:p-12 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-3xl mx-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-2">
          Welcome to the Dashboard
        </h1>
        <p className="text-slate-300 text-lg md:text-xl font-light">
          Your command center for everything antigravity. Let's get started.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/40 active:translate-y-0 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
