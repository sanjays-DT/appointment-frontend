'use client';

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  password: string;
}

interface ErrorState {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<ErrorState>({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
    setErrors({ ...errors, avatar: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors before submit
    setErrors({ name: "", email: "", password: "", avatar: "" });

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    if (avatar) formData.append("avatar", avatar);

    const res = await register(formData);

    if (!res.ok) {
      // If backend returned field-specific errors
      setErrors({
        name: res.errors?.name || "",
        email: res.errors?.email || "",
        password: res.errors?.password || "",
        avatar: res.errors?.avatar || "",
      });
      return;
    }

    // If successful, navigate to login
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background-light dark:bg-background-dark transition-theme">

      {/* LEFT SIDE */}
      <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center px-12">
        <div className="text-center max-w-md space-y-6">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="text-blue-100 text-lg">
            Create your account and get started
          </p>

          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <User size={28} />
              <span className="text-sm text-blue-200 mt-1">Profile</span>
            </div>
            <div className="flex flex-col items-center">
              <Lock size={28} />
              <span className="text-sm text-blue-200 mt-1">Security</span>
            </div>
            <div className="flex flex-col items-center">
              <Mail size={28} />
              <span className="text-sm text-blue-200 mt-1">Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl shadow-xl p-8 md:p-10
          bg-surface-light dark:bg-surface-dark
          text-text-light dark:text-text-dark
          transition-theme">

          <h2 className="text-3xl font-bold mb-2">Sign Up</h2>
          <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
            Join us and manage everything easily
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* AVATAR */}
            <div>
              <label className="block text-sm font-medium mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User size={22} className="text-gray-500 dark:text-gray-300" />
                  </div>
                )}
                <label className="text-primary text-sm cursor-pointer">
                  Upload photo
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              {errors.avatar && <p className="text-danger text-sm mt-1">{errors.avatar}</p>}
            </div>

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border
                    bg-transparent
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:ring-primary outline-none"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border
                    bg-transparent
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:ring-primary outline-none"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border
                    bg-transparent
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Create strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-95 transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
