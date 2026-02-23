'use client'

import { useState } from "react"
import { useAuth } from "../context/AuthContext.tsx"
import api, { baseURL } from "../api/axios.ts"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  PencilIcon,
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid"

export default function Profile() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?._id

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState(
    (user as any)?.avatar
      ? `${baseURL}/users/${userId}/avatar`
      : "/default-avatar.png"
  )

  const [editName, setEditName] = useState(false)
  const [editEmail, setEditEmail] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light dark:bg-background-dark transition-theme">
        <p className="text-text-light dark:text-text-dark">Loading profile...</p>
      </div>
    )
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0])
      setPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  const validateEmailFormat = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required")
    if (!email.trim()) return toast.error("Email is required")
    if (!validateEmailFormat(email))
      return toast.error("Invalid email format")

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      if (avatar) formData.append("avatar", avatar)

      const res = await api.put(`${baseURL}/users/profile`, formData)

      localStorage.setItem("user", JSON.stringify(res.data.user))
      toast.success("Profile updated successfully")

      setEditName(false)
      setEditEmail(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[552px] grid grid-cols-1 md:grid-cols-2 bg-background-light dark:bg-background-dark transition-theme">
      {/* LEFT PANEL */}
      <div className=" hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-12 py-20">
        <div className="text-center space-y-6">
          <UserIcon className="w-16 h-16 mx-auto text-white/90" />
          <h1 className="text-4xl font-bold">Welcome, {user?.name.split(" ")[0]}</h1>
          <p className="text-blue-100 text-lg max-w-xs mx-auto">
            Manage your personal information, update profile picture, and change details securely.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <EnvelopeIcon className="w-6 h-6 text-white/80" />
            <IdentificationIcon className="w-6 h-6 text-white/80" />
            <PencilIcon className="w-6 h-6 text-white/80" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className=" h-[552px] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg p-8 transition-theme">
          <h2 className="text-3xl font-bold text-text-light dark:text-text-dark text-center mb-6">
            Edit Profile
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={preview}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-800 transition-theme"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow">
                <PencilIcon className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-muted-light dark:text-muted-dark text-sm mt-2">
              Click the icon to change your profile picture
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-1 flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-muted-light dark:text-muted-dark" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                readOnly={!editName}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-theme ${
                  !editName
                    ? "bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark cursor-not-allowed text-text-light dark:text-text-dark"
                    : "bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
                }`}
              />
              {!editName && (
                <PencilIcon
                  className="w-5 h-5 text-muted-light dark:text-muted-dark absolute right-3 top-[38px] cursor-pointer hover:text-blue-500"
                  onClick={() => setEditName(true)}
                />
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-1 flex items-center gap-1">
                <EnvelopeIcon className="w-4 h-4 text-muted-light dark:text-muted-dark" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                readOnly={!editEmail}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-theme ${
                  !editEmail
                    ? "bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark cursor-not-allowed text-text-light dark:text-text-dark"
                    : "bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
                }`}
              />
              {!editEmail && (
                <PencilIcon
                  className="w-5 h-5 text-muted-light dark:text-muted-dark absolute right-3 top-[38px] cursor-pointer hover:text-blue-500"
                  onClick={() => setEditEmail(true)}
                />
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-theme ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
