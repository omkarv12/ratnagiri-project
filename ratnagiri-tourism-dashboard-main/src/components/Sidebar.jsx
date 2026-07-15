import { NavLink, useNavigate } from 'react-router-dom';
import { Map, LayoutDashboard, Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, setOpen }) {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed top-5 left-5 z-50 bg-slate-900 text-white p-3 rounded-lg shadow-lg hover:bg-slate-800 transition"
            >
                {open ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white p-6 transform transition-transform duration-300 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >

                <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-100 tracking-wide mt-14">
                    <Map className="text-blue-400" />
                    Ratnagiri Explorer
                </h2>

                <nav>

                    <ul className="space-y-2">

                        <li>

                            <NavLink
                                to="/dashboard"
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-600/20 text-white border-l-4 border-blue-500'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <LayoutDashboard size={20} />
                                Main Dashboard
                            </NavLink>

                        </li>

                        <li>

                            <NavLink
                                to="/map"
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                        isActive
                                            ? 'bg-emerald-600/20 text-emerald-400 border-l-4 border-emerald-500'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-emerald-400'
                                    }`
                                }
                            >
                                <Map size={20} />
                                Interactive Map
                            </NavLink>

                        </li>

                        
                        {user && (

                            <>
                                <li>

                                    <NavLink
                                        to="/admin"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                                    >
                                        <Shield size={20} />
                                        Admin Dashboard
                                    </NavLink>

                                </li>

                                

                            </>

                        )}

                    </ul>

                </nav>

            </aside>
        </>
    );
}