"use client";

import { useEffect, useState } from "react";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

/* ---------------- PASSWORD VALIDATION ---------------- */
const validatePassword = (password: string) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a number";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    return "Must contain a special character";
  return null;
};

type Status = "NONE" | "PENDING" | "APPROVED";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [status, setStatus] = useState<Status>("NONE");
  const [isApproved, setIsApproved] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ---------------- REQUEST RESET ---------------- */
  const requestReset = async () => {
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("PENDING");
      toast.info("Request submitted. Waiting for admin approval...");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Request failed");
    }
  };

  /* ---------------- POLL STATUS ---------------- */
  useEffect(() => {
    if (!email || isApproved) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/auth/forgot-password/check?email=${email}`);
        setRemainingTime(res.data.remainingTime || 0);

        if (res.data.status === "APPROVED") {
          setStatus("APPROVED");
          setIsApproved(true);
          toast.success("Approved! You can reset your password.");
          clearInterval(interval);
        } else {
          setStatus("PENDING");
        }
      } catch {
        // silent polling error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [email, isApproved]);

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPassword = async () => {
    setPasswordError("");
    setConfirmError("");

    let hasError = false;

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else {
      const validationError = validatePassword(password);
      if (validationError) {
        setPasswordError(validationError);
        hasError = true;
      }
    }

    if (!confirm) {
      setConfirmError("Confirm password is required");
      hasError = true;
    } else if (password && password !== confirm) {
      setConfirmError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      await api.post("/auth/forgot-password/reset", { email, password });
      toast.success("Password updated successfully");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  /* ---------------- FORMAT TIME ---------------- */
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-background-light dark:bg-background-dark transition-theme">
      <div className="w-full max-w-md md:max-w-lg bg-surface-light dark:bg-surface-dark rounded-3xl shadow-xl p-8 md:p-12 transition-theme">
        <h1 className="text-3xl font-bold text-center mb-8 text-text-light dark:text-text-dark">
          Forgot Password
        </h1>

        {/* ---------- REQUEST / WAIT UI ---------- */}
        {!isApproved ? (
          <>
            <div className="mb-5">
              <label className="block font-medium mb-2 text-text-light dark:text-text-dark">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                disabled={status === "PENDING"}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-theme
                  bg-surface-light dark:bg-surface-dark
                  text-text-light dark:text-text-dark
                  placeholder-muted-light dark:placeholder-muted-dark
                  ${
                    emailError
                      ? "border-danger focus:ring-red-300"
                      : "border-border-light dark:border-border-dark focus:ring-primary"
                  }`}
              />

              {emailError && (
                <p className="text-danger text-sm mt-1">{emailError}</p>
              )}
            </div>

            <button
              onClick={requestReset}
              disabled={status === "PENDING"}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-95 disabled:opacity-60 transition"
            >
              {status === "PENDING" ? "Request Sent" : "Request Reset"}
            </button>

            {status === "PENDING" && (
              <p className="mt-4 text-center font-medium text-primary">
                Waiting for admin approval ({formatTime(remainingTime)})
              </p>
            )}
          </>
        ) : (
          /* ---------- RESET PASSWORD UI ---------- */
          <>
            <p className="text-success text-center mb-6 font-semibold">
              ✔ Approved — Set your new password
            </p>

            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-theme
                  bg-surface-light dark:bg-surface-dark
                  text-text-light dark:text-text-dark
                  placeholder-muted-light dark:placeholder-muted-dark
                  ${
                    passwordError
                      ? "border-danger focus:ring-red-300"
                      : "border-border-light dark:border-border-dark focus:ring-primary"
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {passwordError && (
                <p className="text-danger text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <div className="mb-6 relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-theme
                  bg-surface-light dark:bg-surface-dark
                  text-text-light dark:text-text-dark
                  placeholder-muted-light dark:placeholder-muted-dark
                  ${
                    confirmError
                      ? "border-danger focus:ring-red-300"
                      : "border-border-light dark:border-border-dark focus:ring-primary"
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {confirmError && (
                <p className="text-danger text-sm mt-1">{confirmError}</p>
              )}
            </div>

            <button
              onClick={resetPassword}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-95 transition"
            >
              Change Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
