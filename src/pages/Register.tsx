'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import validator from "validator";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterErrors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar: string;
};

type InputFieldProps = {
  icon: ReactNode;
  name: keyof RegisterForm;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  error: string;
};

type PasswordFieldProps = {
  name: keyof RegisterForm;
  value: string;
  show: boolean;
  toggle: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error: string;
  placeholder: string;
};

const emptyErrors: RegisterErrors = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  avatar: "",
};

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>(emptyErrors);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const validate = () => {
    const newErrors: RegisterErrors = { ...emptyErrors };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Enter name";
      isValid = false;
    } else if (!validator.isLength(form.name.trim(), { min: 3 })) {
      newErrors.name = "Minimum 3 characters required";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Enter email";
      isValid = false;
    } else if (!validator.isEmail(form.email)) {
      newErrors.email = "Invalid email";
      isValid = false;
    }

    if (
      !validator.isStrongPassword(form.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      newErrors.password = "8+ chars, uppercase, lowercase, number & symbol required";
      isValid = false;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (avatar) {
      if (!avatar.type.startsWith("image/")) {
        newErrors.avatar = "Only image files allowed";
        isValid = false;
      } else if (avatar.size > 2 * 1024 * 1024) {
        newErrors.avatar = "Image must be under 2MB";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof RegisterForm;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim());
    formData.append("password", form.password);
    if (avatar) formData.append("avatar", avatar);

    const res = await register(formData);
    if (!res.ok) {
      toast.error(res.error || "Registration failed");
      return;
    }

    toast.success("Account created successfully");
    navigate("/login");
  };

  return (
    <div className="h-[552px] grid grid-cols-1 md:grid-cols-2 bg-gray-100 dark:bg-gray-900">
      <div className="hidden md:flex bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white items-center justify-center px-12">
        <div className="text-center max-w-sm space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight">Welcome</h1>
          <p className="text-blue-100 text-lg">
            Create your account and start your journey with us
          </p>
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform">
              <User size={32} className="mb-2" />
              <span className="text-sm text-white/80 font-medium">Profile</span>
            </div>
            <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform">
              <Lock size={32} className="mb-2" />
              <span className="text-sm text-white/80 font-medium">Security</span>
            </div>
            <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform">
              <Mail size={32} className="mb-2" />
              <span className="text-sm text-white/80 font-medium">Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-4"
        >
          <h2 className="text-3xl font-bold text-center">Create Account</h2>
          {Object.values(errors).some(Boolean) && (
            <p className="text-sm text-red-500 mt-1 mb-1">
              Please fix the highlighted fields.
            </p>
          )}

          <div className="flex items-center gap-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User size={22} />
              </div>
            )}
            <div>
              <span className="text-lg font-medium">Profile</span>
              <div>
                <label className="text-sm text-blue-600 cursor-pointer hover:underline">
                  Upload photo
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              icon={<User size={18} />}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              error={errors.name}
            />
            <InputField
              icon={<Mail size={18} />}
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              error={errors.email}
            />
            <PasswordField
              name="password"
              value={form.password}
              show={showPassword}
              toggle={() => setShowPassword((prev) => !prev)}
              onChange={handleChange}
              placeholder="Password"
              error={errors.password}
            />
            <PasswordField
              name="confirmPassword"
              value={form.confirmPassword}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword((prev) => !prev)}
              onChange={handleChange}
              placeholder="Confirm Password"
              error={errors.confirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function InputField({ icon, error, type = "text", ...props }: InputFieldProps) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        <input
          {...props}
          type={type}
          title={error || ""}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent ${
            error ? "border-red-500" : "focus:ring-2 focus:ring-blue-500"
          } outline-none`}
        />
      </div>
    </div>
  );
}

function PasswordField({ name, value, show, toggle, onChange, error, placeholder }: PasswordFieldProps) {
  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          title={error || ""}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-transparent ${
            error ? "border-red-500" : "focus:ring-2 focus:ring-blue-500"
          } outline-none`}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
