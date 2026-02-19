'use client';

import { useEffect, useState } from "react";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

type Status = "NONE" | "PENDING" | "APPROVED";
const ROLE = "user";
const THIRTY_MIN = 30 * 60 * 1000;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [status, setStatus] = useState<Status>("NONE");
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
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Email is required");
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password", { email: normalizedEmail, role: ROLE });
      setEmail(normalizedEmail);
      setStatus(res.data.status || "PENDING");
      const requestedAt = res.data.requestedAt ? new Date(res.data.requestedAt).getTime() : Date.now();
      setRemainingTime(Math.max(0, THIRTY_MIN - (Date.now() - requestedAt)));
      toast.info(res.data.message || "Request submitted. Waiting for admin approval.");
    } catch (err: any) {
      const message = err.response?.data?.message || "Request failed";
      const pendingStatus = err.response?.data?.status;

      if (pendingStatus === "PENDING") {
        setEmail(normalizedEmail);
        setStatus("PENDING");
        toast.info(message);
        return;
      }

      setEmailError(message);
    }
  };

  /* ---------------- POLL APPROVAL STATUS ---------------- */
  useEffect(() => {
    if (!email || status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get("/auth/forgot-password/check", {
          params: { email: email.trim().toLowerCase(), role: ROLE },
        });
        setStatus(res.data.status);
        setRemainingTime(res.data.remainingTime || 0);

        if (res.data.status === "APPROVED") {
          toast.success("Your request has been approved. You can now reset your password.");
          clearInterval(interval);
        }
      } catch {
        // silently ignore
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [email, status]);

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPassword = async () => {
    setPasswordError("");
    setConfirmError("");

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    if (!confirm.trim()) {
      setConfirmError("Confirm password is required");
      return;
    }

    if (password !== confirm) {
      setConfirmError("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password/reset", {
        email: email.trim().toLowerCase(),
        password,
        role: ROLE,
      });
      toast.success(res.data.message || "Password updated successfully");
      window.location.href = "/login";
    } catch (err: any) {
      const message = err.response?.data?.message || "Reset failed";
      setPasswordError(message);
    }
  };

  /* ---------------- FORMAT TIME ---------------- */
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Forgot Password</h1>

        {status !== "APPROVED" ? (
          <>
            {/* EMAIL INPUT */}
            <div className="mb-5">
              <label className="block font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                disabled={status === "PENDING"}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  emailError ? "border-danger" : "border-border-light"
                }`}
              />
              <p className="text-danger text-sm mt-1 min-h-[1.25rem]">{emailError}</p>
            </div>

            <button
              onClick={requestReset}
              disabled={status === "PENDING"}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold"
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
          <>
            {/* RESET PASSWORD FORM */}
            <p className="text-success text-center mb-6 font-semibold">
              Approved — Set your new password
            </p>

            {/* PASSWORD INPUT */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    passwordError ? "border-danger" : "border-border-light"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-danger text-sm mt-1 min-h-[1.25rem]">{passwordError}</p>
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    confirmError ? "border-danger" : "border-border-light"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-danger text-sm mt-1 min-h-[1.25rem]">{confirmError}</p>
            </div>

            <button
              onClick={resetPassword}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold"
            >
              Change Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
