import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);   // modal open/close
  const [isAdmin, setIsAdmin]     = useState(false);     // whether typed email is admin
  const [checking, setChecking]   = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");
  const debounceRef               = useRef(null);
  const { login, loading }        = useAuth();
  const navigate                  = useNavigate();

  // ── Debounced role check whenever email changes ────────────────────────────
  useEffect(() => {
    setIsAdmin(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = email.trim();
    // Only check if looks like a valid email
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    debounceRef.current = setTimeout(async () => {
      setChecking(true);
      try {
        const { data } = await api.post("/auth/check-role", { email: trimmed });
        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(debounceRef.current);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const result = await login(email, password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* ── Login Card ── */}
      <div className="w-full max-w-md relative">
        <div className="bg-dark-800 border border-surface-border rounded-3xl p-8 shadow-card animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">CHAMERI Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
                required
                className={`w-full bg-dark-700 border ${errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-surface-border focus:border-brand-500'} rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-colors`}
                placeholder="admin@chameri.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-gray-400 font-medium">Password</label>

                {/* Forgot password — only visible when email belongs to admin */}
                <div className={`transition-all duration-300 ${isAdmin ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  required
                  className={`w-full bg-dark-700 border ${errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-surface-border focus:border-brand-500'} rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-gray-600 outline-none transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Validation Message */}
            {errorMsg && (
              <p className="text-red-500 text-sm mt-1 animate-fade-in font-medium" style={{ color: '#dc0000ff' }}>
                Incorrect password. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-brand text-white font-semibold py-3 rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-600 mt-5">
            Access is restricted to authorized personnel only.
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <ForgotPassword
          initialEmail={email}
          onClose={() => setShowForgot(false)}
        />
      )}
    </div>
  );
};

export default Login;
