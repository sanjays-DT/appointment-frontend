'use client';

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Calendar, Bell, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const auth = useAuth();
  const { login, loading } = auth;
  const forcePasswordChange = (auth as any).forcePasswordChange ?? false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // field-level errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (forcePasswordChange) {
      toast.info("Please change your password to continue");
    }
  }, [forcePasswordChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    const res = await login(email, password);

    if (!res.ok) {
      toast.error(res.error || "Login failed");
      return;
    }

    toast.success("Login successful");
  };

  if (forcePasswordChange) return null;

  return (
    <div
      className="
        min-h-screen grid grid-cols-1 md:grid-cols-2
        bg-background-light dark:bg-background-dark
        transition-theme
      "
    >
      {/* LEFT SIDE */}
      <div className="hidden md:flex bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white items-center justify-center px-12">
        <div className="text-center max-w-md space-y-6">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-blue-100 text-lg">
            Manage your appointments and stay organized effortlessly.
          </p>

          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <Calendar className="w-8 h-8 text-white mb-1" />
              <span className="text-sm text-blue-200">Schedule</span>
            </div>

            <div className="flex flex-col items-center">
              <Bell className="w-8 h-8 text-white mb-1" />
              <span className="text-sm text-blue-200">Notifications</span>
            </div>

            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-white mb-1" />
              <span className="text-sm text-blue-200">Secure</span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center px-4">
        <div
          className="
            w-full max-w-md md:max-w-lg
            bg-surface-light dark:bg-surface-dark
            text-text-light dark:text-text-dark
            rounded-3xl shadow-xl
            p-8 md:p-12
            transition-theme
          "
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2
                             text-muted-light dark:text-muted-dark"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl border
                    bg-surface-light dark:bg-surface-dark
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:outline-none transition
                    ${emailError
                      ? "border-danger focus:ring-danger/40"
                      : "focus:ring-primary/40"
                    }
                  `}
                  placeholder="you@example.com"
                />
              </div>
              {emailError && (
                <p className="text-sm text-danger mt-1">{emailError}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2
                             text-muted-light dark:text-muted-dark"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    w-full pl-10 pr-10 py-3 rounded-xl border
                    bg-surface-light dark:bg-surface-dark
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:outline-none transition
                    ${passwordError
                      ? "border-danger focus:ring-danger/40"
                      : "focus:ring-primary/40"
                    }
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-muted-light dark:text-muted-dark"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-danger mt-1">{passwordError}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                bg-primary text-white font-semibold
                hover:opacity-90 disabled:opacity-60
                transition
              "
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
