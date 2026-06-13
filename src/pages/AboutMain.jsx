import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  Save, Loader2, Image as ImageIcon, X, Plus, UploadCloud
} from "lucide-react";

// --- Form Section Card ---
const FormCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6 animate-fade-in">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

// --- Input Field ---
const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors bg-gray-50/50 focus:bg-white"
    />
  </div>
);

// --- Textarea Field ---
const TextareaField = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
      {label}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 transition-colors bg-gray-50/50 focus:bg-white resize-y"
    />
  </div>
);

const AboutMain = () => {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const logosInputRef = useRef(null);

  // Form State
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");

  const [storyHeading, setStoryHeading] = useState("");
  const [storyDescription, setStoryDescription] = useState("");

  const [founderQuote, setFounderQuote] = useState("");
  const [founderName, setFounderName] = useState("");
  const [founderRole, setFounderRole] = useState("");
  const [founderArchitectsName, setFounderArchitectsName] = useState("");

  // Founder Image State
  const [existingFounderImage, setExistingFounderImage] = useState("");
  const [newFounderImage, setNewFounderImage] = useState(null);
  const [founderPreview, setFounderPreview] = useState("");

  // Work Logos State
  const [existingLogos, setExistingLogos] = useState([]);
  const [newLogos, setNewLogos] = useState([]); // Array of objects { file, preview }

  // Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ["about-main"],
    queryFn: async () => {
      const res = await api.get("/about/main");
      return res.data.data;
    },
    onSuccess: (data) => {
      setHeroHeading(data?.hero?.heading || "");
      setHeroSubheading(data?.hero?.subheading || "");

      setStoryHeading(data?.story?.heading || "");
      setStoryDescription(data?.story?.description || "");

      setFounderQuote(data?.founder?.quote || "");
      setFounderName(data?.founder?.name || "");
      setFounderRole(data?.founder?.role || "");
      setFounderArchitectsName(data?.founder?.architectsName || "");
      
      setExistingFounderImage(data?.founder?.image || "");
      setExistingLogos(data?.workLogos || []);
    }
  });

  // Handle Founder Image
  const handleFounderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFounderImage(file);
      setFounderPreview(URL.createObjectURL(file));
    }
  };

  // Handle Multiple Logos
  const handleLogosChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewLogos(prev => [...prev, ...newPreviews]);
  };

  const removeExistingLogo = (url) => {
    setExistingLogos(prev => prev.filter(u => u !== url));
  };

  const removeNewLogo = (index) => {
    setNewLogos(prev => prev.filter((_, i) => i !== index));
  };

  // Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("heroHeading", heroHeading);
      formData.append("heroSubheading", heroSubheading);
      formData.append("storyHeading", storyHeading);
      formData.append("storyDescription", storyDescription);
      formData.append("founderQuote", founderQuote);
      formData.append("founderName", founderName);
      formData.append("founderRole", founderRole);
      formData.append("founderArchitectsName", founderArchitectsName);
      
      formData.append("existingWorkLogos", JSON.stringify(existingLogos));

      if (newFounderImage) {
        formData.append("founderImage", newFounderImage);
      }

      newLogos.forEach(({ file }) => {
        formData.append("workLogos", file);
      });

      return api.put("/about/main", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("About Main Section updated successfully!");
      setNewFounderImage(null);
      setFounderPreview("");
      setNewLogos([]);
      qc.invalidateQueries(["about-main"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update section");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-dark-800 p-6 rounded-3xl mb-6 shadow-sm border border-surface-border">
        <div>
          <h1 className="text-2xl font-bold text-white">About Us — Main Section</h1>
          <p className="text-gray-400 text-sm mt-1">Manage the content for the main About page.</p>
        </div>
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-glow-sm hover:shadow-glow-md disabled:opacity-50"
        >
          {mutation.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      {/* Hero Section */}
      <FormCard title="Hero Section" icon={ImageIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Heading" value={heroHeading} onChange={e => setHeroHeading(e.target.value)} placeholder="e.g. Building the Future" />
          <InputField label="Subheading" value={heroSubheading} onChange={e => setHeroSubheading(e.target.value)} placeholder="e.g. With passion and precision" />
        </div>
      </FormCard>

      {/* Story Section */}
      <FormCard title="Story Section" icon={ImageIcon}>
        <InputField label="Heading" value={storyHeading} onChange={e => setStoryHeading(e.target.value)} placeholder="e.g. Our Story" />
        <TextareaField label="Description" value={storyDescription} onChange={e => setStoryDescription(e.target.value)} placeholder="Write the story here..." rows={6} />
      </FormCard>

      {/* Founder Section */}
      <FormCard title="Founder Section" icon={ImageIcon}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Upload Area */}
          <div className="w-full md:w-1/3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Founder Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-brand-300 transition-colors overflow-hidden group"
            >
              {(founderPreview || existingFounderImage) ? (
                <>
                  <img src={founderPreview || existingFounderImage} alt="Founder" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <UploadCloud size={24} className="mb-2" />
                    <span className="text-sm font-semibold">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-400">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Click to upload</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFounderImageChange} accept="image/*" className="hidden" />
          </div>

          {/* Details */}
          <div className="w-full md:w-2/3 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Name" value={founderName} onChange={e => setFounderName(e.target.value)} placeholder="e.g. John Doe" />
              <InputField label="Role" value={founderRole} onChange={e => setFounderRole(e.target.value)} placeholder="e.g. CEO & Founder" />
            </div>
            <InputField label="Architects Name" value={founderArchitectsName} onChange={e => setFounderArchitectsName(e.target.value)} placeholder="e.g. CHAMERI Architects" />
            <TextareaField label="Quote" value={founderQuote} onChange={e => setFounderQuote(e.target.value)} placeholder="A quote from the founder..." rows={4} />
          </div>
        </div>
      </FormCard>

      {/* Work Logo Section */}
      <FormCard title="Work Logo Section" icon={ImageIcon}>
        <div className="mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block">Brand / Work Logos</label>
          <p className="text-xs text-gray-500 mt-1">Upload the logos of brands or clients you have worked with.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Existing Logos */}
          {existingLogos.map((url) => (
            <div key={url} className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-3 group">
              <img src={url} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
              <button 
                type="button" 
                onClick={() => removeExistingLogo(url)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* New Logos */}
          {newLogos.map((item, index) => (
            <div key={index} className="relative aspect-square bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-center p-3 group">
              <img src={item.preview} alt="New Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
              <button 
                type="button" 
                onClick={() => removeNewLogo(index)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 rounded-sm">NEW</div>
            </div>
          ))}

          {/* Upload Button */}
          <div 
            onClick={() => logosInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-brand-300 transition-colors flex flex-col items-center justify-center cursor-pointer text-gray-400 group"
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-gray-500" />
            </div>
            <span className="text-xs font-semibold text-gray-500">Add Logo</span>
          </div>
          <input type="file" ref={logosInputRef} onChange={handleLogosChange} accept="image/*" multiple className="hidden" />
        </div>
      </FormCard>
    </form>
  );
};

export default AboutMain;
