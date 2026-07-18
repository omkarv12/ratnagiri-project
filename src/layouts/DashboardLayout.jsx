import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut } from "lucide-react";


export default function DashboardLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const location = useLocation();

    const showLoginButton =
        location.pathname === "/dashboard" && !user;

    const showLogoutButton =
        user &&
        (
            location.pathname === "/dashboard" ||
            location.pathname === "/admin"
        );

    return (

        <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">

            <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
            />

            <main
                className={`flex-1 transition-all duration-300 ${
                    sidebarOpen ? "ml-64" : "ml-0"
                }`}
            >

                {/* Top Bar */}

                <div className="flex justify-end items-center px-8 pt-6">

                    {showLoginButton && (

                        <button
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
                        >
                            <LogIn size={18} />
                            Admin Login
                        </button>

                    )}

                    {showLogoutButton && (

                        <button
                            onClick={() => {
                                logout();
                                navigate("/dashboard");
                            }}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow transition"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>

                    )}

                </div>

                <div className="p-8 pt-4">

                    <Outlet />

                </div>

            </main>

        </div>

    );

}