import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { Loader2, Info, CheckCircle } from "lucide-react";

// --- Custom Hook for flash success ---
const useFlashSuccess = (duration = 2000) => {
  const [saved, setSaved] = useState(false);
  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), duration);
  };
  return { saved, flash };
};

// --- Reusable Form Card Component ---
const FormCard = ({ title, icon: Icon, children, onSave, isSaving, saved }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 mb-6 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-600 shadow-sm border border-gray-100">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
      </div>

      <div className="space-y-5">{children}</div>

      <div className="mt-6 flex justify-end items-center gap-3 border-t border-gray-50 pt-5">
        {/* Success Banner */}
        <div
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-green-50 text-green-600 border border-green-100 transition-all duration-300 ease-in-out ${
            saved ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none absolute right-40"
          }`}
        >
          <CheckCircle size={16} /> Saved!
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center min-w-[120px] ${
            isSaving
              ? "bg-amber-100 text-amber-700 shadow-inner scale-95 cursor-not-allowed"
              : "bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:shadow-lg active:scale-95"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Section"
          )}
        </button>
      </div>
    </div>
  );
};

// --- Input Field Component ---
const InputField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block p-3 transition-colors outline-none"
    />
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const HomeAbout = () => {
  const qc = useQueryClient();
  const aboutFlash = useFlashSuccess();

  // State
  const [heading, setHeading] = useState("");
  const [count1, setCount1] = useState("");
  const [count1Text, setCount1Text] = useState("");
  const [count2, setCount2] = useState("");
  const [count2Text, setCount2Text] = useState("");
  const [count3, setCount3] = useState("");
  const [count3Text, setCount3Text] = useState("");
  const [count4, setCount4] = useState("");
  const [count4Text, setCount4Text] = useState("");

  // Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ["home-main"],
    queryFn: async () => {
      const res = await api.get("/home/main");
      return res.data.data;
    },
  });

  // Seed data
  useEffect(() => {
    if (!data) return;
    setHeading(data?.aboutUs?.heading || "");
    setCount1(data?.aboutUs?.count1 || "");
    setCount1Text(data?.aboutUs?.count1Text || "");
    setCount2(data?.aboutUs?.count2 || "");
    setCount2Text(data?.aboutUs?.count2Text || "");
    setCount3(data?.aboutUs?.count3 || "");
    setCount3Text(data?.aboutUs?.count3Text || "");
    setCount4(data?.aboutUs?.count4 || "");
    setCount4Text(data?.aboutUs?.count4Text || "");
  }, [data]);

  // Mutation
  const aboutMutation = useMutation({
    mutationFn: async () => api.put("/home/main/about-us", { 
      heading, count1, count1Text, count2, count2Text, count3, count3Text, count4, count4Text 
    }),
    onSuccess: () => {
      aboutFlash.flash();
      qc.invalidateQueries(["home-main"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save About Us section"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Header */}
      <div className="bg-dark-800 p-6 rounded-3xl mb-6 shadow-sm border border-surface-border">
        <h1 className="text-2xl font-bold text-white">Home — About Us Section</h1>
        <p className="text-gray-400 text-sm mt-1">Manage the heading and statistics for the Home About Us page.</p>
      </div>

      {/* ── About Us Section ── */}
      <FormCard
        title="About Us Details"
        icon={Info}
        onSave={() => aboutMutation.mutate()}
        isSaving={aboutMutation.isLoading}
        saved={aboutFlash.saved}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <InputField 
              label="Heading" 
              value={heading} 
              onChange={e => setHeading(e.target.value)} 
              placeholder="e.g. Learn more about our company..." 
            />
          </div>

          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-brand-600 mb-2">Counter 1</h3>
            <InputField label="Count" value={count1} onChange={e => setCount1(e.target.value)} placeholder="e.g. 150+" />
            <InputField label="Text" value={count1Text} onChange={e => setCount1Text(e.target.value)} placeholder="e.g. Projects Completed" />
          </div>

          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-brand-600 mb-2">Counter 2</h3>
            <InputField label="Count" value={count2} onChange={e => setCount2(e.target.value)} placeholder="e.g. 50+" />
            <InputField label="Text" value={count2Text} onChange={e => setCount2Text(e.target.value)} placeholder="e.g. Expert Team" />
          </div>

          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-brand-600 mb-2">Counter 3</h3>
            <InputField label="Count" value={count3} onChange={e => setCount3(e.target.value)} placeholder="e.g. 100%" />
            <InputField label="Text" value={count3Text} onChange={e => setCount3Text(e.target.value)} placeholder="e.g. Client Satisfaction" />
          </div>

          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-brand-600 mb-2">Counter 4</h3>
            <InputField label="Count" value={count4} onChange={e => setCount4(e.target.value)} placeholder="e.g. 10+" />
            <InputField label="Text" value={count4Text} onChange={e => setCount4Text(e.target.value)} placeholder="e.g. Years Experience" />
          </div>
        </div>
      </FormCard>
    </div>
  );
};

export default HomeAbout;
