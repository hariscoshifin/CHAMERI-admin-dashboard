import { useState, useRef, useEffect } from "react";
import { X, KeyRound, ShieldCheck, Loader2, Eye, EyeOff, RefreshCw, Mail } from "lucide-react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

// ─── OTP Input boxes ──────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, i) => (i === idx ? "" : d));
      onChange(next.join(""));
      if (idx > 0) inputs.current[idx - 1]?.focus();
      return;
    }
    if (!/^[0-9]$/.test(e.key)) return;
    const next = digits.map((d, i) => (i === idx ? e.key : d));
    onChange(next.join(""));
    if (idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    onChange(next.join(""));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}}
          className="w-11 h-12 text-center text-xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-gray-900 transition-all duration-200 caret-transparent"
        />
      ))}
    </div>
  );
};

// ─── Step dots ────────────────────────────────────────────────────────────────
const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

const StepDot = ({ step, current }) => (
  <div className="flex items-center gap-1.5">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        step.id < current
          ? "bg-emerald-500 text-white"
          : step.id === current
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-400 border border-gray-200"
      }`}
    >
      {step.id < current ? "✓" : step.id}
    </div>
    {step.id < steps.length && (
      <div className={`w-6 h-px transition-all duration-500 ${step.id < current ? "bg-emerald-400" : "bg-gray-200"}`} />
    )}
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
/**
 * Props:
 *  initialEmail  — the admin's LOGIN email (from login page). Used internally
 *                  to identify the account. NOT shown to the user.
 *  onClose       — close the modal
 */
const ForgotPassword = ({ initialEmail = "", onClose }) => {
  const [step, setStep]                     = useState(1);
  // The user-entered recovery email (must match what admin set in User Management)
  const [recoveryEmail, setRecoveryEmail]   = useState("");
  const [recoveryHint, setRecoveryHint]     = useState("");
  const [otp, setOtp]                       = useState("");
  const [resetToken, setResetToken]         = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);
  const [loading, setLoading]               = useState(false);
  const [countdown, setCountdown]           = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Step 1: Validate recovery email & send OTP ──────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!recoveryEmail) return toast.error("Please enter the recovery email.");
    setLoading(true);
    try {
      // Send both:
      //   email         = admin's login email (identifies the account — internal)
      //   recoveryEmail = what the user typed (must match stored recovery email)
      const { data } = await api.post("/auth/forgot-password", {
        email: initialEmail,
        recoveryEmail: recoveryEmail.trim(),
      });
      setRecoveryHint(data.recoveryHint || "");
      toast.success("OTP sent! Check the recovery email inbox.");
      setCountdown(60);
      setOtp("");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.replace(/\s/g, "").length < 6) return toast.error("Enter the full 6-digit OTP.");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email: initialEmail, otp });
      setResetToken(data.resetToken);
      toast.success("OTP verified! Set your new password.");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: initialEmail, resetToken, newPassword: password });
      toast.success("Password reset successfully! Please log in.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Please start over.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-7">
          {/* Icon */}
          <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
            <KeyRound size={20} className="text-white" />
          </div>

          {/* Title & description */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            {step === 1 && (
              <>
                Enter the <strong className="text-gray-700">recovery email</strong> configured in User Management.
                Only that email is accepted — your login email will not work here.
              </>
            )}
            {step === 2 && (
              <>
                A 6-digit OTP was sent to{" "}
                <span className="font-semibold text-gray-700">{recoveryHint || "the recovery email"}</span>.
                Enter it below.
              </>
            )}
            {step === 3 && "OTP verified. Choose a strong new password for your account."}
          </p>

          {/* Step dots */}
          <div className="flex items-center mb-6">
            {steps.map((s) => <StepDot key={s.id} step={s} current={step} />)}
          </div>

          {/* ── Step 1: Recovery Email ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                  Recovery Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="Enter the recovery email address"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50"
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2 flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  This must match the recovery email set in the User Management section.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block text-center">
                  Enter 6-digit OTP
                </label>
                <OtpInput value={otp} onChange={setOtp} />
              </div>

              <button
                type="submit"
                disabled={loading || otp.replace(/\s/g, "").length < 6}
                className="w-full bg-gray-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify OTP"}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-gray-400">
                    Resend in <span className="text-gray-700 font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw size={11} /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${password === confirmPassword ? "text-emerald-600" : "text-red-500"}`}>
                    {password === confirmPassword ? (
                      <><ShieldCheck size={11} /> Passwords match</>
                    ) : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirmPassword || password.length < 6}
                className="w-full bg-gray-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
