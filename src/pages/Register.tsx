'use client'

import { useState } from "react"
import { useAuth } from "../context/AuthContext.tsx"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import validator from "validator"

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
  })

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = { name: "", email: "", password: "", avatar: "" }
    let isValid = true

    // Name
    if (!form.name.trim()) {
      newErrors.name = "Enter name"
      isValid = false
    } else if (!validator.isLength(form.name.trim(), { min: 3 })) {
      newErrors.name = "Name must be at least 3 characters"
      isValid = false
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Enter email"
      isValid = false
    } else if (!validator.isEmail(form.email)) {
      newErrors.email = "Enter a valid email address"
      isValid = false
    }

    // Password
    if (!form.password) {
      newErrors.password = "Enter password"
      isValid = false
    } else if (
      !validator.isStrongPassword(form.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      newErrors.password =
        "Password must be 8+ characters and include uppercase, lowercase, number, and symbol"
      isValid = false
    }

    // Avatar (optional)
    if (avatar) {
      if (!avatar.type.startsWith("image/")) {
        newErrors.avatar = "Only image files are allowed"
        isValid = false
      } else if (avatar.size > 2 * 1024 * 1024) {
        newErrors.avatar = "Image must be under 2MB"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAvatar(file)
    setAvatarPreview(file ? URL.createObjectURL(file) : null)
    setErrors({ ...errors, avatar: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.append("name", form.name.trim())
    formData.append("email", form.email)
    formData.append("password", form.password)
    if (avatar) formData.append("avatar", avatar)

    const res = await register(formData)

    if (!res.ok) {
      toast.error(res.error || "Registration failed")
    } else {
      toast.success("Account created successfully")
      navigate("/login")
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background-light dark:bg-background-dark transition-theme">

      {/* LEFT SIDE */}
      <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white items-center justify-center px-12">
        <div className="text-center max-w-sm space-y-8">
          {/* Heading */}
          <h1 className="text-5xl font-extrabold tracking-tight">Welcome</h1>
          <p className="text-blue-100 text-lg">
            Create your account and start your journey with us
          </p>
          {/* Icon Cards */}
          <div className="flex justify-center gap-6">
            {/* Profile Card */}
            <div className="flex flex-col items-center  p-4  hover:scale-105 transition-transform">
              <User size={32} className="text-white mb-2" />
              <span className="text-sm text-white/80 font-medium">Profile</span>
            </div>
            {/* Security Card */}
            <div className="flex flex-col items-center  backdrop-blur-md p-4 hover:scale-105 transition-transform">
              <Lock size={32} className="text-white mb-2" />
              <span className="text-sm text-white/80 font-medium">Security</span>
            </div>
            {/* Access Card */}
            <div className="flex flex-col items-center  backdrop-blur-md p-4   hover:scale-105 transition-transform">
              <Mail size={32} className="text-white mb-2" />
              <span className="text-sm text-white/80 font-medium">Access</span>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="relative">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-1 bg-white/30 rounded-full blur-xl"></div>
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
              <label className="block text-sm font-medium mb-2">
                Profile Photo
              </label>
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
              {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:ring-primary outline-none"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent
                    border-border-light dark:border-border-dark
                    focus:ring-2 focus:ring-primary outline-none"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                  className="w-full pl-10 pr-10 py-3 rounded-xl border bg-transparent
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                text-white font-semibold hover:opacity-95 transition"
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
  )
}
