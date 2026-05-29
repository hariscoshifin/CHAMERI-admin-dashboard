import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import {
  FolderOpen, Briefcase, Users, MessageSquare,
  FileText, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  Clock, Eye, Mail,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Fake chart data (replace with real API data later) ──────────────────────
const trafficData = [
  { month: "Jan", projects: 2, contacts: 8 },
  { month: "Feb", projects: 4, contacts: 12 },
  { month: "Mar", projects: 3, contacts: 7 },
  { month: "Apr", projects: 6, contacts: 18 },
  { month: "May", projects: 5, contacts: 14 },
  { month: "Jun", projects: 8, contacts: 22 },
  { month: "Jul", projects: 7, contacts: 19 },
];

const categoryData = [
  { name: "Architecture", value: 38 },
  { name: "Interior", value: 28 },
  { name: "Landscape", value: 18 },
  { name: "Commercial", value: 16 },
];

const PIE_COLORS = ["#2952ff", "#7c3aed", "#06b6d4", "#10b981"];

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, change, changeType, color }) => (
  <div className="stat-card group cursor-default">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg
        ${changeType === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
        {changeType === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}
      </span>
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// ─── Contact Status Badge ─────────────────────────────────────────────────────
const statusStyles = {
  new: "bg-brand-500/10 text-brand-400",
  read: "bg-gray-500/10 text-gray-400",
  replied: "bg-emerald-500/10 text-emerald-400",
  archived: "bg-yellow-500/10 text-yellow-400",
};

const ContactRow = ({ contact }) => (
  <div className="flex items-center gap-4 py-3 border-b border-surface-border last:border-0">
    <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-gray-400 font-semibold text-sm shrink-0">
      {contact.name?.[0]?.toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{contact.name}</p>
      <p className="text-xs text-gray-500 truncate">{contact.subject || contact.email}</p>
    </div>
    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${statusStyles[contact.status] || statusStyles.new}`}>
      {contact.status}
    </span>
  </div>
);

// ─── Recent Project Row ────────────────────────────────────────────────────────
const ProjectRow = ({ project }) => (
  <div className="flex items-center gap-4 py-3 border-b border-surface-border last:border-0">
    {project.coverImage ? (
      <img src={project.coverImage} alt={project.title}
        className="w-10 h-10 rounded-xl object-cover shrink-0" />
    ) : (
      <div className="w-10 h-10 rounded-xl bg-dark-600 flex items-center justify-center shrink-0">
        <FolderOpen size={16} className="text-gray-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{project.title}</p>
      <p className="text-xs text-gray-500">{project.category}</p>
    </div>
    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize
      ${project.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
      {project.status}
    </span>
  </div>
);

// ─── Custom Tooltip for Chart ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-surface-border rounded-xl p-3 text-xs shadow-card">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data.data;
    },
    retry: 1,
  });

  // Use fallback data while loading or if API isn't ready
  const stats = data?.stats || {};
  const recentContacts = data?.recentContacts || [];
  const recentProjects = data?.recentProjects || [];

  const statCards = [
    {
      icon: FolderOpen,
      label: "Total Projects",
      value: stats.totalProjects ?? "—",
      change: "+12%",
      changeType: "up",
      color: "bg-gradient-to-br from-brand-500 to-brand-700",
    },
    {
      icon: Briefcase,
      label: "Active Services",
      value: stats.totalServices ?? "—",
      change: "+4%",
      changeType: "up",
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
    },
    {
      icon: Users,
      label: "Dashboard Users",
      value: stats.totalTeam ?? "—",
      change: "0%",
      changeType: "up",
      color: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    },
    {
      icon: MessageSquare,
      label: "New Inquiries",
      value: stats.newContacts ?? "—",
      change: "+28%",
      changeType: "up",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    },
    {
      icon: FileText,
      label: "Published Blogs",
      value: stats.publishedBlogs ?? "—",
      change: "-5%",
      changeType: "down",
      color: "bg-gradient-to-br from-orange-500 to-orange-700",
    },
    {
      icon: Star,
      label: "Testimonials",
      value: stats.totalTestimonials ?? "—",
      change: "+8%",
      changeType: "up",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-700",
    },
  ];

  if (isError) {
    // Dashboard still renders with placeholders — non-blocking
    console.warn("Dashboard API not connected yet. Showing placeholder data.");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back — here's what's happening with CHAMERI.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-surface border border-surface-border rounded-xl px-4 py-2">
          <Clock size={14} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area Chart — Activity */}
        <div className="col-span-2 bg-surface border border-surface-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Activity Overview</h3>
              <p className="text-gray-500 text-xs mt-0.5">Projects added & contacts received</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-brand-400">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                Projects
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                Contacts
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2952ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2952ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3158" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="projects" stroke="#2952ff" strokeWidth={2} fill="url(#colorProjects)" name="Projects" />
              <Area type="monotone" dataKey="contacts" stroke="#7c3aed" strokeWidth={2} fill="url(#colorContacts)" name="Contacts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Categories */}
        <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-white font-semibold">Project Categories</h3>
            <p className="text-gray-500 text-xs mt-0.5">Distribution by type</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#141832", border: "1px solid #2a3158", borderRadius: "12px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {item.name}
                </span>
                <span className="text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Data Row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Contacts */}
        <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-brand-400" />
              <h3 className="text-white font-semibold">Recent Inquiries</h3>
            </div>
            <span className="bg-brand-500/10 text-brand-400 text-xs font-semibold px-2 py-1 rounded-lg">
              {stats.newContacts ?? 0} new
            </span>
          </div>
          {recentContacts.length > 0 ? (
            recentContacts.map((c) => <ContactRow key={c._id} contact={c} />)
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">No contacts yet</p>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-purple-400" />
              <h3 className="text-white font-semibold">Recent Projects</h3>
            </div>
            <span className="bg-purple-500/10 text-purple-400 text-xs font-semibold px-2 py-1 rounded-lg">
              {stats.totalProjects ?? 0} total
            </span>
          </div>
          {recentProjects.length > 0 ? (
            recentProjects.map((p) => <ProjectRow key={p._id} project={p} />)
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">No projects yet</p>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-card">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Project", to: "/projects/new", color: "bg-brand-500 hover:bg-brand-600" },
            { label: "New Blog Post", to: "/blogs/new", color: "bg-purple-600 hover:bg-purple-700" },
            { label: "Manage Users", to: "/users", color: "bg-cyan-600 hover:bg-cyan-700" },
            { label: "View Contacts", to: "/contacts", color: "bg-emerald-600 hover:bg-emerald-700" },
          ].map(({ label, to, color }) => (
            <a
              key={label}
              href={to}
              className={`${color} text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-glow-sm hover:-translate-y-0.5 flex items-center gap-2`}
            >
              <TrendingUp size={14} />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
