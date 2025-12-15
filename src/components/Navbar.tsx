import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import NotificationsDropdown from "./NotificationsDropdown.tsx";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user && !!token;

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left section */}
        <div className="flex items-center space-x-8">
          <Link
            to="/categories"
            className="font-bold text-2xl text-blue-600 hover:text-blue-700 transition"
          >
            Appointment App
          </Link>

          {isLoggedIn && (
            <div className="hidden md:flex space-x-6">
              <Link
                to="/categories"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Categories
              </Link>
              <Link
                to="/my-appointments"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                My Appointments
              </Link>
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="hidden md:flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <span className="text-gray-800 font-medium truncate max-w-[120px]">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
              <div className="relative z-50">
                <NotificationsDropdown />
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition px-3 py-2 rounded hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-600 transition px-3 py-2 rounded hover:bg-gray-100"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-8 h-8 flex flex-col justify-between items-center group"
          >
            <span
              className={`h-1 w-full bg-gray-700 rounded-lg transition-all duration-300 ease-in-out 
                ${menuOpen ? "rotate-45 translate-y-3" : ""}`}
            ></span>
            <span
              className={`h-1 w-full bg-gray-700 rounded-lg transition-all duration-300 ease-in-out 
                ${menuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`h-1 w-full bg-gray-700 rounded-lg transition-all duration-300 ease-in-out 
                ${menuOpen ? "-rotate-45 -translate-y-3" : ""}`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-max-height duration-500 overflow-hidden ${
          menuOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col mt-2 space-y-2 px-4 pb-4 border-t">
          {isLoggedIn ? (
            <>
              <Link
                to="/categories"
                className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/my-appointments"
                className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                My Appointments
              </Link>

              <div className="flex items-center space-x-3 px-3 py-2">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-gray-800 font-medium text-sm">{user.name}</span>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition text-sm"
              >
                Logout
              </button>

              <NotificationsDropdown variant="mobile" />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
