import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiClock, FiActivity, FiSearch, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

const Reports = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/admin/logs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-10 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-10 transition-colors">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center tracking-tighter">
            <FiActivity className="mr-4 text-emerald-500" /> Audit Trail
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Comprehensive logs of all system-critical actions.</p>
        </div>
        <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">System Monitor</div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 italic">Decrypting audit history...</div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div 
              key={log._id} 
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:border-emerald-100 dark:hover:border-emerald-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center space-x-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-gray-400 dark:text-gray-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500 transition-colors">
                  <FiClock size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-gray-900 dark:text-white tracking-tight">{log.user || "System"}</span>
                    <FiArrowRight size={14} className="text-gray-300 dark:text-gray-700" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">{log.action}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">
                    Verified at {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">+{log.value || 1}</span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Impact Score</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center p-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 font-black uppercase tracking-widest text-xs">No activity recorded... yet.</div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
