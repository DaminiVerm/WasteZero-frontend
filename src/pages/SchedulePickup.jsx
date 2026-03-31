import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  FiMapPin, FiCalendar, FiClock, FiTrash2, FiMessageSquare, 
  FiCheckCircle, FiChevronRight, FiList, FiPackage, FiInfo, FiActivity
} from "react-icons/fi";
import API from "../services/api";

const wasteOptions = [
    { name: "Plastic", icon: "🥤" },
    { name: "Paper", icon: "📄" },
    { name: "Glass", icon: "🍾" },
    { name: "Metal", icon: "🥫" },
    { name: "Electronic Waste", icon: "💻" },
    { name: "Organic Waste", icon: "🌱" },
    { name: "Other", icon: "📦" }
];

const SchedulePickup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pickups, setPickups] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    date: "",
    timeSlot: "",
    wasteTypes: [],
    notes: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;

  useEffect(() => {
    fetchUserPickups();
  }, []);

  const fetchUserPickups = async () => {
    try {
      setFetching(true);
      const res = await API.get(`/pickups/user/${userId}`);
      setPickups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching pickups:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleWasteType = (value) => {
    setFormData(prev => {
      const exists = prev.wasteTypes.includes(value);
      return {
        ...prev,
        wasteTypes: exists ? prev.wasteTypes.filter(v => v !== value) : [...prev.wasteTypes, value]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.wasteTypes.length === 0) {
        toast.error("Please select at least one waste type");
        return;
    }

    setLoading(true);
    try {
      await API.post("/pickups", formData);
      toast.success("Schedule confirmed! A recycling agent will reach out.");
      setFormData({
        address: "",
        city: "",
        date: "",
        timeSlot: "",
        wasteTypes: [],
        notes: ""
      });
      fetchUserPickups();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule pickup.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50";
      case "Accepted": return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50";
      case "In Progress": return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50";
      case "Completed": return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/50";
      case "Rejected": return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50";
      case "Closed": return "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700";
      default: return "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Waste Collection</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Schedule a quick pickup and track your recycling impact.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
           <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 transition-colors">
              <FiPackage className="text-xl" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none">Your Stats</p>
              <p className="text-sm font-black text-gray-900 dark:text-white transition-colors">{pickups.length} Collections</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        
        {/* ── Collection Form ───────────────────────────────────────── */}
        <div className="lg:col-span-12 xl:col-span-5">
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
             <div className="bg-green-600 dark:bg-green-700 p-8 text-white">
                <h2 className="text-xl font-black flex items-center tracking-tight">
                  <FiCalendar className="mr-3" /> Schedule New Pickup
                </h2>
                <p className="text-green-100 dark:text-green-200 text-sm mt-1 font-medium">Tell us where and when to collect your waste.</p>
             </div>

             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">City</label>
                      <input 
                        name="city" value={formData.city} onChange={handleChange} required 
                        placeholder="e.g. Bangalore"
                        className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-green-500 font-bold outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Preferred Date</label>
                      <input 
                        type="date" name="date" value={formData.date} onChange={handleChange} required 
                        className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-green-500 font-bold outline-none transition-all" 
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Pickup Address</label>
                   <div className="relative">
                      <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
                      <input 
                        name="address" value={formData.address} onChange={handleChange} required 
                        placeholder="Street, Building, Flat No."
                        className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-xl py-3.5 pl-12 pr-5 focus:ring-2 focus:ring-green-500 font-bold outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Time Slot</label>
                   <select 
                     name="timeSlot" value={formData.timeSlot} onChange={handleChange} required 
                     className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-green-500 font-bold outline-none appearance-none transition-all"
                   >
                      <option value="">Select a slot</option>
                      <option value="09:00 - 12:00">Morning (09–12)</option>
                      <option value="12:00 - 15:00">Afternoon (12–03)</option>
                      <option value="15:00 - 18:00">Evening (03–06)</option>
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Waste Types</label>
                   <div className="flex flex-wrap gap-2">
                      {wasteOptions.map(opt => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => toggleWasteType(opt.name)}
                          className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                            ${formData.wasteTypes.includes(opt.name) 
                              ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-500/20 dark:shadow-none' 
                              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-green-200 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400'}
                          `}
                        >
                          <span className="mr-1">{opt.icon}</span> {opt.name}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Notes (Optional)</label>
                   <textarea 
                     name="notes" value={formData.notes} onChange={handleChange} rows="2"
                     placeholder="Access codes, gate info, etc."
                     className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-green-500 font-medium outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                   />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-indigo-600 dark:bg-indigo-600 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Schedule"}
                </button>
             </form>
           </div>
        </div>

        {/* ── Pickups History ───────────────────────────────────────── */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center tracking-tight transition-colors">
                 <FiActivity className="mr-3 text-indigo-500" /> Recent Schedules
              </h3>
              <div className="flex space-x-2">
                 <button onClick={fetchUserPickups} className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-400 dark:text-gray-500 hover:text-green-600 transition-all shadow-sm">
                    <FiList />
                 </button>
              </div>
           </div>

           {fetching ? (
              <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 h-32 rounded-[2rem] animate-pulse"></div>)}
              </div>
           ) : pickups.length > 0 ? (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                 <AnimatePresence>
                    {pickups.map((p, idx) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                           <div className="space-y-4 flex-1">
                              <div className="flex items-center space-x-4">
                                 <h4 className="font-black text-xl text-gray-900 dark:text-white tracking-tight transition-colors">{p.city}</h4>
                                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusColor(p.status)}`}>
                                   {p.status}
                                 </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center transition-colors">
                                 <FiMapPin className="mr-2 text-green-500 dark:text-green-600" /> {p.address}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-2">
                                 {p.wasteTypes?.map(w => (
                                    <span key={w} className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700 transition-all">{w}</span>
                                 ))}
                              </div>
                           </div>

                           <div className="flex md:flex-col justify-between md:items-end gap-4 shrink-0">
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-none mb-2">Schedule</p>
                                 <p className="text-sm font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors">{p.date}</p>
                                 <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">{p.timeSlot}</p>
                              </div>
                              {p.status === "Pending" && (
                                <button className="p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-300 dark:text-rose-900 transition-colors rounded-xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white">
                                   <FiTrash2 size={20} />
                                </button>
                              )}
                           </div>
                        </div>
                        {p.notes && (
                           <div className="mt-6 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-dashed border-gray-100 dark:border-gray-800 transition-colors">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic flex items-center leading-relaxed">
                                 <FiInfo className="mr-3 text-indigo-400" /> {p.notes}
                              </p>
                           </div>
                        )}
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           ) : (
              <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] py-28 flex flex-col items-center justify-center text-center px-10 transition-colors shadow-inner">
                 <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-200 dark:text-gray-700 mb-6 group-hover:scale-110 transition-all">
                    <FiPackage size={40} />
                 </div>
                 <h4 className="font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] text-sm">No Active Pickups</h4>
                 <p className="text-sm text-gray-300 dark:text-gray-500 mt-3 font-medium max-w-[250px]">Use the form to schedule your first waste collection today.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default SchedulePickup;