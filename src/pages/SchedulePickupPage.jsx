import { useEffect, useState } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiClock, FiMapPin, FiTrash2, FiCheckCircle, FiXCircle, 
  FiPackage, FiInfo, FiCalendar, FiArrowLeft, FiTruck, FiCheckSquare 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SchedulePickupPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdminOrNGO = user.role === "admin" || user.role === "ngo";

  const fetchData = async () => {
    try {
      setLoading(true);
      // If admin/ngo, get all. Otherwise get user-specific (handled in SchedulePickup.jsx too, but this is the management view)
      const res = await API.get("/pickups"); 
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load collection logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/pickups/${id}/status`, { status });
      toast.success(`Pickup status: ${status}`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Status update failed");
    }
  };

  const deletePickup = async (id) => {
    if (!window.confirm("Permanently remove this collection record?")) return;
    try {
      await API.delete(`/pickups/${id}`);
      toast.success("Record deleted");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50";
      case "Accepted": return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50";
      case "In Progress": return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50";
      case "Completed": return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/50";
      case "Rejected": return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50";
      default: return "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700";
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Retrieving Logs...</p>
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div onClick={() => navigate("/schedule")} className="flex items-center text-green-600 font-bold text-sm cursor-pointer hover:underline mb-2">
             <FiArrowLeft className="mr-2" /> Back to Scheduler
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Management Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Monitoring and updating waste collection lifecycles.</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center space-x-3 shadow-sm transition-colors">
           <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><FiPackage /></div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">System Wide</p>
              <p className="text-sm font-black text-gray-900">{data.length} Total Pickups</p>
           </div>
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {data.length > 0 ? data.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col group"
            >
              <div className="p-8 space-y-5 flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none group-hover:text-green-600 transition-colors">{item.city || "Area Pickup"}</h2>
                     <p className="text-xs text-gray-400 dark:text-gray-500 font-bold max-w-[180px] truncate transition-colors">{item.address}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(item.status)}`}>
                    ● {item.status || "Pending"}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 grid grid-cols-2 gap-4 transition-colors">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-none">Collection</p>
                       <p className="text-xs font-black text-gray-700 dark:text-gray-300">{item.date}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-none">Time</p>
                       <p className="text-xs font-black text-gray-700 dark:text-gray-300">{item.timeSlot}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Target Materials</p>
                    <div className="flex flex-wrap gap-2">
                        {item.wasteTypes?.map(type => (
                            <span key={type} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-lg text-[9px] font-bold transition-colors">{type}</span>
                        ))}
                    </div>
                </div>

                {item.notes && (
                    <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-xl flex items-start space-x-3 border border-dashed border-indigo-100 dark:border-indigo-900/30 transition-colors">
                        <FiInfo className="mt-0.5 text-indigo-400 shrink-0" />
                        <p className="text-[11px] text-indigo-600/70 dark:text-indigo-400 italic font-medium leading-relaxed">{item.notes}</p>
                    </div>
                )}
              </div>

              {/* ── Action Bar ────────────────────────────────────────── */}
              <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                
                {isAdminOrNGO && (
                  <div className="flex items-center space-x-2 w-full">
                    {item.status === "Pending" && (
                      <button 
                        onClick={() => updateStatus(item._id, "Accepted")} 
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center justify-center"
                      >
                         <FiTruck className="mr-2" /> Accept
                      </button>
                    )}
                    {item.status === "Accepted" && (
                      <button 
                        onClick={() => updateStatus(item._id, "In Progress")} 
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center"
                      >
                         <FiPackage className="mr-2" /> Start Pickup
                      </button>
                    )}
                    {item.status === "In Progress" && (
                      <button 
                        onClick={() => updateStatus(item._id, "Completed")} 
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md active:scale-95 flex items-center justify-center"
                      >
                         <FiCheckSquare className="mr-2" /> Mark Done
                      </button>
                    )}
                    {(item.status === "Pending") && (
                      <button 
                        onClick={() => updateStatus(item._id, "Rejected")} 
                        className="p-3 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded-xl border border-gray-100 dark:border-gray-800 transition-all active:scale-95 shadow-sm"
                      >
                         <FiXCircle />
                      </button>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={() => deletePickup(item._id)} 
                  className="w-full mt-2 py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center space-x-2"
                >
                   <FiTrash2 /> <span>Remove Record</span>
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-40 text-center space-y-4 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 transition-colors">
               <div className="text-6xl text-gray-100 dark:text-gray-800 flex justify-center"><FiTruck /></div>
               <p className="text-xl font-bold text-gray-400">No managed collections found.</p>
               <button onClick={() => navigate("/schedule")} className="text-green-600 dark:text-green-400 font-black uppercase text-xs tracking-widest bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-all">Go to Scheduler</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}