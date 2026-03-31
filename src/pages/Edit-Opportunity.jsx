import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiArrowLeft, FiImage, FiSettings, FiMapPin, FiCalendar, FiClock, FiBriefcase } from "react-icons/fi";

export default function EditOpportunity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    duration: "",
    status: "",
    wasteType: "General",
    requiredSkills: ""
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing data
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await axios.get(`/api/opportunity/${id}`);
        setFormData({
          ...res.data,
          date: res.data.date ? res.data.date.substring(0, 10) : "",
          requiredSkills: Array.isArray(res.data.requiredSkills) 
            ? res.data.requiredSkills.join(", ") 
            : res.data.requiredSkills || ""
        });
        setPreview(res.data.image ? `/${res.data.image}` : "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load strategy details");
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunity();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
console.log("TOKEN:", token);
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (image) {
        data.append("image", image);
      }

      await axios.put(`/api/opportunity/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Initiative updated successfully! 🚀");
      navigate(`/opportunity/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Process failed. Please verify details.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div onClick={() => navigate(`/opportunity/${id}`)} className="flex items-center text-gray-400 font-bold text-sm cursor-pointer hover:text-green-600 mb-8 transition-all group">
         <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Discard Changes
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors"
      >
        <div className="bg-green-600 dark:bg-green-700 p-12 text-white text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Modify Opportunity</h1>
            <p className="text-green-100 dark:text-green-200 font-medium">Refine the objectives and logistics of your recycling campaign.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          {/* General Information */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 text-green-600 dark:text-green-400 mb-2">
                <FiBriefcase className="text-2xl" />
                <h2 className="text-lg font-black uppercase tracking-widest">Core Narrative</h2>
            </div>
            
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Initiative Title</label>
                <input 
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-green-500 transition-all outline-none font-bold"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Campaign Description</label>
                <textarea 
                    name="description"
                    rows="4"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-green-500 transition-all outline-none font-medium leading-relaxed"
                />
            </div>
          </section>

          {/* Logistics */}
          <section className="grid md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 mb-2">
                    <FiMapPin className="text-2xl" />
                    <h2 className="text-lg font-black uppercase tracking-widest">Logistics</h2>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Primary Location</label>
                    <input 
                        name="location" 
                        required 
                        value={formData.location}
                        onChange={handleChange} 
                        className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Event Date</label>
                        <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Duration</label>
                        <input name="duration" required value={formData.duration} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" />
                    </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center space-x-3 text-orange-500 dark:text-orange-400 mb-2">
                    <FiSettings className="text-2xl" />
                    <h2 className="text-lg font-black uppercase tracking-widest">Configuration</h2>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Campaign Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-orange-500 font-bold appearance-none transition-all cursor-pointer">
                        <option value="Open">Open Invitation</option>
                        <option value="Closed">Archived / Closed</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Waste Category</label>
                    <select name="wasteType" value={formData.wasteType} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-orange-500 font-bold appearance-none transition-all cursor-pointer">
                        <option value="General">General Waste</option>
                        <option value="Plastic">Plastic Recycling</option>
                        <option value="E-Waste">Electronics / E-Waste</option>
                        <option value="Paper">Paper / Cardboard</option>
                        <option value="Hazardous">Hazardous / Medical</option>
                    </select>
                </div>
             </div>
          </section>

          {/* Media */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 text-indigo-500 dark:text-indigo-400 mb-2">
                <FiImage className="text-2xl" />
                <h2 className="text-lg font-black uppercase tracking-widest">Marketing Assets</h2>
            </div>
            
            <div className="relative group cursor-pointer h-64 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 overflow-hidden">
                {preview ? (
                    <>
                        <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-3 rounded-2xl text-indigo-600 dark:text-indigo-400 font-black flex items-center shadow-2xl">
                             Update Banner
                        </div>
                    </>
                ) : (
                    <div className="space-y-2 text-center pointer-events-none">
                        <FiImage className="mx-auto text-4xl text-gray-200 dark:text-gray-700" />
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500">Upload new campaign image</p>
                    </div>
                )}
                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-gray-900 dark:bg-green-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-[2.5rem] hover:bg-black dark:hover:bg-green-700 transition-all shadow-2xl active:scale-95"
          >
            Overwrite Initiative Data
          </button>
        </form>
      </motion.div>
    </div>
  );
}