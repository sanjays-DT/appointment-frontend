import { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PencilIcon } from "@heroicons/react/24/solid"; 
import { baseURL } from "../api/axios.ts";

export default function Profile() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(
    user?.avatar ? `${baseURL}/usersImage/${userId}/avatar` : "/default-avatar.png"
  );

  // Edit state flags
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  // Handle avatar selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Email validation
  const validateEmailFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!validateEmailFormat(email)) return toast.error("Invalid email format");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (avatar) formData.append("avatar", avatar);

      const res = await api.put(`${baseURL}/usersImage/profile`, formData);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile updated successfully");

      setEditName(false);
      setEditEmail(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={preview}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 mb-2"
        />
        <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Change Profile Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div className="relative">
          <label className="block text-left mb-1 font-medium">Name</label>
          <input
            type="text"
            value={name}
            readOnly={!editName}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              !editName ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            }`}
          />
          {!editName && (
            <PencilIcon
              className="w-5 h-5 text-gray-500 absolute right-3 top-[38px] cursor-pointer hover:text-blue-500"
              onClick={() => setEditName(true)}
            />
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <label className="block text-left mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            readOnly={!editEmail}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              !editEmail ? "bg-gray-100 cursor-not-allowed" : "bg-white"
            }`}
          />
          {!editEmail && (
            <PencilIcon
              className="w-5 h-5 text-gray-500 absolute right-3 top-[38px] cursor-pointer hover:text-blue-500"
              onClick={() => setEditEmail(true)}
            />
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full px-4 py-2 rounded text-white font-medium ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } transition`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
