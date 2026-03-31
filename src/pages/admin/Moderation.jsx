import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Moderation = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/opportunities", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(res.data);
    } catch (err) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const deleteOpportunity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this opportunity? This action is permanent.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`/api/admin/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.msg);
      fetchOpportunities();
    } catch (err) {
      toast.error("Failed to delete opportunity");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center text-gray-900 dark:text-white tracking-tighter">
            <FiAlertTriangle className="mr-3 text-amber-500" /> Content Moderation
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Reviewing Platform Activity</p>
        </div>
        <span className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
          {opportunities.length} Items Total
        </span>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-500 font-medium">Scanning for inappropriate content...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {opportunities.map((opp) => (
              <motion.div 
                key={opp._id} 
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-shadow"
              >
                <div className="h-48 bg-gray-50 dark:bg-gray-800 relative">
                  {opp.image ? (
                    <img src={opp.image} alt="opp" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex bg-indigo-50/50 dark:bg-indigo-900/20 items-center justify-center h-full text-indigo-400 dark:text-indigo-600">
                      <FiInfo size={48} />
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest ${
                    opp.status === 'Open' ? 'bg-green-600 shadow-lg shadow-green-500/20' : 'bg-gray-400'
                  }`}>
                    {opp.status}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h4 className="font-black text-xl text-gray-900 dark:text-white line-clamp-1 tracking-tight">{opp.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{opp.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       {new Date(opp.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => deleteOpportunity(opp._id)}
                      className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-3 rounded-xl hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all transform active:scale-90"
                      title="Delete Permanently"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Moderation;
