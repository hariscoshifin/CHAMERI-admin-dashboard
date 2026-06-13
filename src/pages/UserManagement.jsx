import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  ShieldCheck, RefreshCw, Plus, Trash2, Mail,
  Key, X, Loader2, AlertTriangle, Check, Users,
  Eye, EyeOff,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLES = [
  {
    value: "admin",
    label: "Admin",
    warning: "⚠️ Admin has full access including user management.",
    color: "bg-red-100 text-red-600",
    badgeClass: "bg-red-50 text-red-600 border border-red-200",
  },
  {
    value: "editor",
    label: "Editor",
    warning: "Editor can create and edit content but cannot manage users.",
    color: "bg-blue-100 text-blue-600",
    badgeClass: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  {
    value: "viewer",
    label: "Viewer",
    warning: "Viewer has read-only access to the dashboard.",
    color: "bg-gray-100 text-gray-600",
    badgeClass: "bg-gray-100 text-gray-500 border border-gray-200",
  },
];

const getRoleInfo = (role) =>
  ROLES.find((r) => r.value === role) || ROLES[1];

const avatarUrl = (name, email) => {
  const initials = (name || email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&bold=true&size=64`;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Role Stats Card ──────────────────────────────────────────────────────────
const StatCard = ({ count, label, colorClass }) => (
  <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
    <p className={`text-3xl font-bold ${colorClass}`}>{count ?? 0}</p>
    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">{label}</p>
  </div>
);

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const info = getRoleInfo(role);
  return (
    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${info.badgeClass}`}>
      {info.label}
    </span>
  );
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ user, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <h3 className="text-center text-lg font-bold text-gray-900">Delete User?</h3>
      <p className="text-center text-sm text-gray-500 mt-2">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-800">{user?.name || user?.email}</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Create User Modal ────────────────────────────────────────────────────────
const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectedRole = getRoleInfo(form.role);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/users", form);
      toast.success("User created successfully!");
      onCreated(data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus size={18} className="text-brand-500" /> New User
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Full Name</label>
            <input
              name="name" value={form.name} onChange={handleChange} required
              placeholder="John Doe"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          {/* Email */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange} required
              placeholder="user@chameri.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          {/* Password */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password" value={form.password} onChange={handleChange} required
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {/* Role */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Role</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertTriangle size={11} />
              {selectedRole.warning}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Fetch users
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  // Fetch recovery email
  const { data: emailData, refetch: refetchEmail } = useQuery({
    queryKey: ["recovery-email"],
    queryFn: async () => {
      const { data } = await api.get("/admin/recovery-email");
      return data.data;
    },
  });

  const users = data?.data || [];
  const stats = data?.stats || { admin: 0, editor: 0, viewer: 0 };
  const recoveryEmail = emailData?.email || null;

  // Delete user
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Save recovery email
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await api.put("/admin/recovery-email", { email: emailInput });
      toast.success("Recovery email saved!");
      refetchEmail();
      setEditEmail(false);
      setEmailInput("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save email");
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <ShieldCheck size={20} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-gray-500 text-sm">Create and manage dashboard users and roles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 rounded-xl border border-surface-border text-gray-400 hover:text-white hover:border-brand-500/50 transition-all"
          >
            <RefreshCw size={16} className={isRefetching ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} /> New User
          </button>
        </div>
      </div>

      {/* ── Recovery Email Card ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={18} className="text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800">Recovery Email</p>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Used for the "Forgot Password" flow. Only you can see and manage this.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditEmail(!editEmail);
              setEmailInput(recoveryEmail || "");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Key size={12} />
            {editEmail ? "Cancel" : recoveryEmail ? "Update" : "Set Email"}
          </button>
        </div>

        {/* Current email display */}
        {!editEmail && (
          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
            <Mail size={14} className="text-gray-400" />
            {recoveryEmail ? (
              <>
                <span className="text-sm text-gray-700">{recoveryEmail}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <Check size={12} /> Set
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400 italic">No recovery email set yet</span>
            )}
          </div>
        )}

        {/* Inline edit form */}
        {editEmail && (
          <form onSubmit={handleSaveEmail} className="mt-4 border-t border-gray-100 pt-4 flex gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              placeholder="recovery@chameri.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={savingEmail}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {savingEmail ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </button>
          </form>
        )}
      </div>

      {/* ── Role Stats ── */}
      <div className="flex gap-4">
        <StatCard count={stats.admin} label="Admins" colorClass="text-red-500" />
        <StatCard count={stats.editor} label="Editors" colorClass="text-blue-500" />
        <StatCard count={stats.viewer} label="Viewers" colorClass="text-gray-500" />
      </div>

      {/* ── Users Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-100">
          <div className="col-span-6 text-xs font-bold uppercase tracking-widest text-gray-400">User</div>
          <div className="col-span-3 text-xs font-bold uppercase tracking-widest text-gray-400">Role</div>
          <div className="col-span-3 text-xs font-bold uppercase tracking-widest text-gray-400">Created</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No users yet</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
            >
              {/* User info */}
              <div className="col-span-6 flex items-center gap-3">
                <img
                  src={avatarUrl(user.name, user.email)}
                  alt={user.name}
                  className="w-9 h-9 rounded-full shrink-0"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="min-w-0">
                  {user.name && (
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-3 flex items-center">
                <RoleBadge role={user.role} />
              </div>

              {/* Created + Delete */}
              <div className="col-span-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">{formatDate(user.createdAt)}</span>
                <button
                  onClick={() => setDeleteTarget(user)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ["admin-users"] })}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default UserManagement;
