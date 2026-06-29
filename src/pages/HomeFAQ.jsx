import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { Loader2, HelpCircle, CheckCircle, Plus, X } from "lucide-react";

const useFlashSuccess = (duration = 2000) => {
  const [saved, setSaved] = useState(false);
  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), duration);
  };
  return { saved, flash };
};

const FormCard = ({ title, icon: Icon, children, onSave, isSaving, saved }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 mb-6 relative overflow-hidden transition-all duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-600 shadow-sm border border-gray-100">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
    </div>

    <div className="space-y-5">{children}</div>

    <div className="mt-6 flex justify-end items-center gap-3 border-t border-gray-50 pt-5">
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

const InputField = ({ label, value, onChange, placeholder, isTextarea }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
      {label}
    </label>
    {isTextarea ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block p-3 transition-colors outline-none resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block p-3 transition-colors outline-none"
      />
    )}
  </div>
);

const MIN_FAQS = 6;

const HomeFAQ = () => {
  const qc = useQueryClient();
  const faqFlash = useFlashSuccess();

  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [faqs, setFaqs] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ["home-main"],
    queryFn: async () => {
      const res = await api.get("/home/main");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!data) return;

    setHeading(data.faqSection?.heading || "");
    setSubheading(data.faqSection?.subheading || "");

    let initialFaqs = [];
    if (data.faqSection?.faqs && data.faqSection.faqs.length > 0) {
      initialFaqs = data.faqSection.faqs.map((f, i) => ({
        id: Date.now() + i,
        question: f.question || "",
        answer: f.answer || "",
      }));
    }

    while (initialFaqs.length < MIN_FAQS) {
      initialFaqs.push({ id: Date.now() + initialFaqs.length, question: "", answer: "" });
    }

    setFaqs(initialFaqs);
  }, [data]);

  const addFaq = () => {
    setFaqs([...faqs, { id: Date.now(), question: "", answer: "" }]);
  };

  const removeFaq = (id) => {
    if (faqs.length <= MIN_FAQS) {
      toast.error(`Minimum ${MIN_FAQS} FAQ items required.`);
      return;
    }
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const updateFaq = (id, field, value) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const faqMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        heading,
        subheading,
        faqsData: JSON.stringify(faqs.map(f => ({ question: f.question, answer: f.answer }))),
      };
      return api.put("/home/main/faq", payload);
    },
    onSuccess: () => {
      faqFlash.flash();
      qc.invalidateQueries(["home-main"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save FAQ section"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <div className="bg-dark-800 p-6 rounded-3xl mb-6 shadow-sm border border-surface-border">
        <h1 className="text-2xl font-bold text-white">Home — FAQ Section</h1>
        <p className="text-gray-400 text-sm mt-1">Manage frequently asked questions. Minimum {MIN_FAQS} required.</p>
      </div>

      <FormCard
        title="FAQ Details"
        icon={HelpCircle}
        onSave={() => faqMutation.mutate()}
        isSaving={faqMutation.isPending}
        saved={faqFlash.saved}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <InputField
            label="Heading"
            value={heading}
            onChange={e => setHeading(e.target.value)}
            placeholder="e.g. Frequently Asked Questions"
          />
          <InputField
            label="Subheading"
            value={subheading}
            onChange={e => setSubheading(e.target.value)}
            placeholder="e.g. Everything you need to know"
          />
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4 relative">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black uppercase tracking-widest text-brand-500">FAQ {index + 1}</p>
                {faqs.length > MIN_FAQS && (
                  <button
                    onClick={() => removeFaq(faq.id)}
                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    title="Remove FAQ"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <InputField
                label="Question"
                value={faq.question}
                onChange={e => updateFaq(faq.id, "question", e.target.value)}
                placeholder="e.g. What services do you offer?"
              />
              <InputField
                label="Answer"
                value={faq.answer}
                onChange={e => updateFaq(faq.id, "answer", e.target.value)}
                placeholder="e.g. We offer a wide range of..."
                isTextarea
              />
            </div>
          ))}
        </div>

        <button
          onClick={addFaq}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-500 font-semibold hover:bg-gray-50 hover:text-brand-600 hover:border-brand-300 transition-all"
        >
          <Plus size={20} /> Add More FAQ
        </button>
      </FormCard>
    </div>
  );
};

export default HomeFAQ;
