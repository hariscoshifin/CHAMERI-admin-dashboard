import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Loader2, User, Mail, Lock, ShieldCheck } from "lucide-react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success("Admin registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-dark-800 border border-surface-border rounded-3xl p-8 shadow-card animate-fade-in">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Register a new admin account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-dark-700 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@chameri.com"
                  className="w-full bg-dark-700 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Role</label>
              <div className="relative">
                <ShieldCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-dark-700 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-dark-700 border border-surface-border rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat your password"
                  className="w-full bg-dark-700 border border-surface-border rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            {form.password && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      form.password.length >= level * 3
                        ? level <= 1 ? "bg-red-500"
                          : level <= 2 ? "bg-yellow-500"
                          : level <= 3 ? "bg-blue-500"
                          : "bg-emerald-500"
                        : "bg-dark-400"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-brand text-white font-semibold py-3 rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
            </button>
          </form>

          {/* Back to login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
