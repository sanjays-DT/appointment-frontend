"use client";

import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import NotificationsDropdown from "./NotificationsDropdown.tsx";
import { baseURL } from "../api/axios.ts";
import { Calendar, Menu, Sun, Moon } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext.tsx";

export default function Navbar() {
  const auth = useAuth();
  const { user, token, logout } = auth;
  const { darkMode, toggleDarkMode } = useDarkMode();
  const forcePasswordChange = (auth as any).forcePasswordChange ?? false;

  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!token && !!user && !forcePasswordChange;

  const avatarSrc =
    user && user.id
      ? `${baseURL}/users/${user.id}/avatar`
      : "/default-avatar.png";

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  return (
    <nav
      className="
        sticky top-0 z-50
        bg-surface-light/80 dark:bg-surface-dark/80
        backdrop-blur-xl
        border-b border-border-light dark:border-border-dark
        transition-theme
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}
          <Link
            to={isLoggedIn ? "/categories" : "/login"}
            className="flex items-center gap-2 font-semibold text-lg
              text-text-light dark:text-text-dark"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Calendar size={20} />
            </div>
            Appointment App
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex flex-1 items-center justify-between ml-10">
            {isLoggedIn ? (
              <>
                {/* LEFT LINKS */}
                <div className="flex items-center gap-3">
                  {[
                    { to: "/categories", label: "Categories" },
                    { to: "/my-appointments", label: "My Appointments" },
                  ].map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `
                        text-sm font-medium px-4 py-2 rounded-lg transition
                        ${isActive
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                          : "text-muted-light dark:text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                        `
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                {/* RIGHT SECTION */}
                <div className="flex items-center gap-5">
                  {/* PROFILE */}
                  <button
                    onClick={() => navigate("/profile")}
                    className="
                      flex items-center gap-3 px-3 py-2 rounded-full transition
                      hover:bg-gray-100 dark:hover:bg-gray-800
                    "
                  >
                    <img
                      src={avatarSrc}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover border border-border-light dark:border-border-dark"
                    />
                    <span className="text-sm font-medium text-text-light dark:text-text-dark max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </button>

                  {/* NOTIFICATIONS */}
                  <div className="relative z-50">
                    <NotificationsDropdown />
                  </div>

                  {/* LOGOUT */}
                  <button
                    onClick={logout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition"
                  >
                    Logout
                  </button>

                  {/* THEME TOGGLE */}
                  <button
                    onClick={toggleDarkMode}
                    className="
                      p-2 rounded-full
                      bg-gray-200 dark:bg-gray-700
                      text-gray-800 dark:text-gray-200
                      transition
                    "
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {darkMode ? <Sun className="text-yellow-500 transition-all duration-300" />
                      : <Moon className="text-dark-500 transition-all duration-300" />}
                  </button>
                </div>
              </>
            ) : (
              /* GUEST NAVBAR */
              <div className="flex items-center gap-1 ml-auto
                bg-gray-100 dark:bg-gray-800 p-1 rounded-full transition">
                <Link
                  to="/login"
                  className={`px-5 py-2 text-sm font-medium rounded-full transition
                    ${isLogin
                      ? "bg-blue-600 text-white shadow"
                      : "text-muted-light dark:text-muted-dark"
                    }
                  `}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className={`px-5 py-2 text-sm font-medium rounded-full transition
                    ${isRegister
                      ? "bg-blue-600 text-white shadow"
                      : "text-muted-light dark:text-muted-dark"
                    }
                  `}
                >
                  Register
                </Link>

                {/* THEME TOGGLE */}
                <button
                  onClick={toggleDarkMode}
                  className="
                      p-2 rounded-full
                      bg-gray-200 dark:bg-gray-700
                      text-gray-800 dark:text-gray-200
                      transition
                    "
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? <Sun className="text-yellow-500 transition-all duration-300" />
                    : <Moon className="text-dark-500 transition-all duration-300" />}
                </button>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-lg p-2
              hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Menu size={24} className="text-text-light dark:text-text-dark" />
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300
            ${menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="pt-4 pb-6 space-y-2">
            {isLoggedIn ? (
              <>
                {["/categories", "/my-appointments"].map((path) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className="
                      block px-4 py-3 rounded-lg text-sm font-medium
                      text-muted-light dark:text-muted-dark
                      hover:bg-gray-100 dark:hover:bg-gray-800
                    "
                  >
                    {path === "/categories" ? "Categories" : "My Appointments"}
                  </NavLink>
                ))}

                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <img
                    src={avatarSrc}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <span className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                    {user?.name}
                  </span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Logout
                </button>

                <div className="relative z-50">
                  <NotificationsDropdown />
                </div>
              </>
            ) : (
              <div className="flex gap-2 px-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
