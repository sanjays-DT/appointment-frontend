import { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
    submit: "",
  });

  const validateForm = () => {
    let newErrors: any = { name: "", email: "", password: "", avatar: "", submit: "" };
    let isValid = true;

    if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (avatar && !avatar.startsWith("http")) {
      newErrors.avatar = "Avatar must be a valid image URL";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: "", email: "", password: "", avatar: "", submit: "" });

    if (!validateForm()) return;

    const res = await register({ name, email, password, avatar });

    if (!res.ok) {
      setErrors((prev) => ({ ...prev, submit: res.error || "Registration failed" }));
      toast.error(res.error || "Registration failed"); 
    } else {
      toast.success("Registered successfully!"); 
      navigate("/categories");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 px-4">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 
          p-6 sm:p-8 rounded-2xl shadow-lg animate-fadeIn flex flex-col
        "
      >
        <h1 className="text-white text-3xl font-bold mb-6 text-center">Create Account</h1>

        {/* Submit error */}
        {errors.submit && (
          <p className="bg-red-500/20 text-red-100 p-2 mb-4 rounded text-center text-sm">
            {errors.submit}
          </p>
        )}

        {/* Avatar */}
        <div className="mb-4">
          <label className="text-white text-sm">Avatar URL</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="w-full p-3 mt-1 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-indigo-300 outline-none"
            placeholder="https://example.com/avatar.jpg"
          />
          {errors.avatar && <p className="text-red-200 text-sm mt-1">{errors.avatar}</p>}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-white text-sm">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mt-1 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-indigo-300 outline-none"
            placeholder="Your full name"
          />
          {errors.name && <p className="text-red-200 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-white text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mt-1 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-indigo-300 outline-none"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-200 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-white text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mt-1 rounded-lg bg-white/70 focus:bg-white focus:ring-2 focus:ring-indigo-300 outline-none"
            placeholder="Enter password"
          />
          {errors.password && <p className="text-red-200 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow hover:bg-gray-100 transition-all"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-white text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="underline text-white">Login</a>
        </p>
      </form>
    </div>
  );
}
