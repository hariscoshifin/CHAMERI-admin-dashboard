import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { Loader2, Image as ImageIcon, CheckCircle, UploadCloud, X } from "lucide-react";

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

// --- Component to Manage Gallery Card ---
const GalleryCardManager = ({ index, cardData, onUpdate }) => {
  const fileInputRef = useRef(null);

  const [name, setName] = useState(cardData.name || "");
  const [place, setPlace] = useState(cardData.place || "");
  const [date, setDate] = useState(cardData.date || "");
  const [existingImages, setExistingImages] = useState(cardData.images || []);
  const [newImages, setNewImages] = useState([]);

  // Sync to parent when local state changes
  useEffect(() => {
    onUpdate({ name, place, date, existingImages, newImages });
  }, [name, place, date, existingImages, newImages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrentImages = existingImages.length + newImages.length;
    
    if (totalCurrentImages + files.length > 2) {
      toast.error(`Card ${index}: You can only upload a maximum of 2 images.`);
      return;
    }

    const newPreviews = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (url) => setExistingImages(prev => prev.filter(u => u !== url));
  const removeNewImage = (idx) => setNewImages(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4 relative">
      <p className="text-xs font-black uppercase tracking-widest text-brand-500 absolute top-4 right-4">Card {index}</p>
      
      {/* Inputs */}
      <div className="space-y-3 pt-6">
        <InputField label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Modern Villa" />
        <InputField label="Place" value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Dubai, UAE" />
        <InputField label="Date" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g. October 2023" />
      </div>

      {/* Image Upload */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Images (Max 2)</label>
          <span className="text-xs font-semibold text-brand-500">{existingImages.length + newImages.length} / 2</span>
        </div>

        {existingImages.length + newImages.length < 2 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-300 transition-colors"
          >
            <UploadCloud size={20} className="text-gray-400 mb-1" />
            <span className="text-xs font-medium text-gray-500">Add Image</span>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        )}

        {/* Previews */}
        <div className="flex gap-3 mt-3">
          {existingImages.map((url, i) => (
            <div key={`ext-${i}`} className="relative w-20 h-20 rounded-xl border border-gray-200 bg-white overflow-hidden group shadow-sm flex-shrink-0">
              <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeExistingImage(url)}
                className="absolute top-1 right-1 p-1 bg-red-500/90 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {newImages.map((img, i) => (
            <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl border-2 border-brand-200 bg-brand-50 overflow-hidden group shadow-sm flex-shrink-0">
              <img src={img.preview} alt={`new-${i}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeNewImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-500/90 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const HomeGallery = () => {
  const qc = useQueryClient();
  const galleryFlash = useFlashSuccess();

  // State
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [cardsData, setCardsData] = useState({
    card1: { name: "", place: "", date: "", existingImages: [], newImages: [] },
    card2: { name: "", place: "", date: "", existingImages: [], newImages: [] },
    card3: { name: "", place: "", date: "", existingImages: [], newImages: [] },
    card4: { name: "", place: "", date: "", existingImages: [], newImages: [] },
    card5: { name: "", place: "", date: "", existingImages: [], newImages: [] },
  });

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
    if (!data || !data.gallery) return;
    setHeading(data.gallery.heading || "");
    setSubheading(data.gallery.subheading || "");
    
    setCardsData({
      card1: { ...data.gallery.card1, newImages: [], existingImages: data.gallery.card1?.images || [] },
      card2: { ...data.gallery.card2, newImages: [], existingImages: data.gallery.card2?.images || [] },
      card3: { ...data.gallery.card3, newImages: [], existingImages: data.gallery.card3?.images || [] },
      card4: { ...data.gallery.card4, newImages: [], existingImages: data.gallery.card4?.images || [] },
      card5: { ...data.gallery.card5, newImages: [], existingImages: data.gallery.card5?.images || [] },
    });
  }, [data]);

  const handleCardUpdate = (key, newData) => {
    setCardsData(prev => ({ ...prev, [key]: newData }));
  };

  // Mutation
  const galleryMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("subheading", subheading);
      
      ["card1", "card2", "card3", "card4", "card5"].forEach(key => {
        formData.append(`${key}Name`, cardsData[key].name);
        formData.append(`${key}Place`, cardsData[key].place);
        formData.append(`${key}Date`, cardsData[key].date);
        formData.append(`${key}ExistingImages`, JSON.stringify(cardsData[key].existingImages));
        
        cardsData[key].newImages.forEach(img => {
          formData.append(`${key}Images`, img.file);
        });
      });

      return api.put("/home/main/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      galleryFlash.flash();
      qc.invalidateQueries(["home-main"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save Gallery section"),
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
      {/* Header */}
      <div className="bg-dark-800 p-6 rounded-3xl mb-6 shadow-sm border border-surface-border">
        <h1 className="text-2xl font-bold text-white">Home — Gallery Section</h1>
        <p className="text-gray-400 text-sm mt-1">Manage the image gallery showcasing our best projects.</p>
      </div>

      {/* ── Gallery Section ── */}
      <FormCard
        title="Gallery Details"
        icon={ImageIcon}
        onSave={() => galleryMutation.mutate()}
        isSaving={galleryMutation.isLoading}
        saved={galleryFlash.saved}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <InputField 
            label="Heading" 
            value={heading} 
            onChange={e => setHeading(e.target.value)} 
            placeholder="e.g. Our Portfolio" 
          />
          <InputField 
            label="Subheading" 
            value={subheading} 
            onChange={e => setSubheading(e.target.value)} 
            placeholder="e.g. Explore our finest work" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {["card1", "card2", "card3", "card4", "card5"].map((key, i) => (
            <GalleryCardManager
              key={key}
              index={i + 1}
              cardData={cardsData[key]}
              onUpdate={(newData) => handleCardUpdate(key, newData)}
            />
          ))}
        </div>
      </FormCard>
    </div>
  );
};

export default HomeGallery;
