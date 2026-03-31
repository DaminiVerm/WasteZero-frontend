import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlus, FiMapPin, FiCalendar, FiClock, FiImage, FiSettings, FiBriefcase, FiTrash2 } from "react-icons/fi";

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    duration: "",
    image: null,
    wasteType: "General",
    requiredSkills: "",
    status: "Open",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setForm({ ...form, image: file });
      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/opportunity/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to create opportunity");

      toast.success("Initiative launched successfully! 🚀");
      navigate("/opportunities");
    } catch (err) {
      console.error(err);
      toast.error("Process failed. Please verify all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors"
      >
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 sm:p-8 lg:p-12 text-white text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Post New Opportunity</h1>
            <p className="text-indigo-100 dark:text-indigo-200 font-medium">Define a new community initiative for smart waste management.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 lg:p-12 space-y-8 sm:space-y-10">
          
          {/* General Information */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 mb-2">
                <FiBriefcase className="text-2xl" />
                <h2 className="text-lg font-black uppercase tracking-widest">Base Information</h2>
            </div>
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Initiative Title</label>
                <input 
                    name="title"
                    required
                    autoComplete="off"
                    onChange={handleChange}
                    placeholder="e.g., Community Beach Clean-up Drive"
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Campaign Description</label>
                <textarea 
                    name="description"
                    rows="4"
                    required
                    onChange={handleChange}
                    placeholder="Describe the goals, the impact, and why volunteers should join..."
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none font-medium leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
            </div>
          </section>

          {/* Logistics */}
          <section className="grid md:grid-cols-2 gap-6 lg:gap-8">
             <div className="space-y-6">
                <div className="flex items-center space-x-3 text-green-600 dark:text-green-400 mb-2">
                    <FiMapPin className="text-2xl" />
                    <h2 className="text-lg font-black uppercase tracking-widest">Field Logistics</h2>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Primary Location</label>
                    <input 
                        name="location" 
                        required 
                        autoComplete="street-address"
                        list="location-suggestions"
                        onChange={handleChange} 
                        className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                        placeholder="City, Area or Landmark" 
                    />
                    <datalist id="location-suggestions">
                        <option value="Downtown Central" />
                        <option value="Green Valley Park" />
                        <option value="Industrial Zone A" />
                        <option value="North Shore Beach" />
                        <option value="East Side Community" />
                    </datalist>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Event Date</label>
                        <input type="date" name="date" required onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Duration</label>
                        <input name="duration" required onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-green-500 font-bold transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" placeholder="Ex: 4 Hours" />
                    </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center space-x-3 text-orange-500 dark:text-orange-400 mb-2">
                    <FiSettings className="text-2xl" />
                    <h2 className="text-lg font-black uppercase tracking-widest">Specifications</h2>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Waste Category</label>
                    <select name="wasteType" onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-orange-500 font-bold appearance-none transition-all">
                        <option value="General">General Waste</option>
                        <option value="Plastic">Plastic Recycling</option>
                        <option value="E-Waste">Electronics / E-Waste</option>
                        <option value="Paper">Paper / Cardboard</option>
                        <option value="Hazardous">Hazardous / Medical</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Required Skills (Comma separated)</label>
                    <input name="requiredSkills" onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-orange-500 font-bold transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" placeholder="Heavy Lifting, Sorting, Driving..." />
                </div>
             </div>
          </section>

          {/* Media */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 text-indigo-500 dark:text-indigo-400 mb-2">
                <FiImage className="text-2xl" />
                <h2 className="text-lg font-black uppercase tracking-widest">Media Assets</h2>
            </div>
            
            <div className="relative group cursor-pointer h-52 sm:h-64 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 overflow-hidden">
                {preview ? (
                    <>
                        <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-3 rounded-2xl text-indigo-600 dark:text-indigo-400 font-black flex items-center shadow-2xl">
                            <FiPlus className="mr-2" /> Change Image
                        </div>
                    </>
                ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                        <FiImage className="mx-auto text-4xl text-gray-200 dark:text-gray-700" />
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500">Drag or click to upload campaign banner</p>
                    </div>
                )}
                <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    required 
                    onChange={handleChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-[2.5rem] hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Initializing Initiative..." : "Deploy Opportunity"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
