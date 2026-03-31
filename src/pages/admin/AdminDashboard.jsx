import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";
import { FiUsers, FiBox, FiClipboard, FiActivity, FiShield, FiAlertTriangle, FiCheckCircle, FiServer, FiGlobe } from "react-icons/fi";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-bold tracking-tighter uppercase">Platform Scan in progress...</p>
        </div>
    );

    const platformCards = [
        { title: "Total Users", value: stats?.totalUsers || 0, icon: <FiUsers />, color: "from-blue-500 to-indigo-600 shadow-indigo-500" },
        { title: "Pending Pickups", value: stats?.pendingPickups || 0, icon: <FiBox />, color: "from-green-500 to-emerald-600 shadow-green-500" },
        { title: "Completed Pickups", value: stats?.completedPickups || 0, icon: <FiActivity />, color: "from-orange-400 to-red-500 shadow-orange-500" },
        { title: "Active Opportunities", value: stats?.activeOpportunities || 0, icon: <FiShield />, color: "from-purple-500 to-indigo-700 shadow-purple-500" },
    ];

    const downloadReport = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get("/api/admin/download/master", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "WasteZero_Report.pdf");
    document.body.appendChild(link);
    link.click();

  } catch (error) {
    console.error("Download failed", error);
  }

};

    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
                <div>
                   <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">System Console</h1>
                   <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Platform-Wide Command & Control</p>
                </div>
                <div className="flex items-center space-x-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                   <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg"><FiServer /></div>
                   <div className="pr-4">
                     <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">System Status</p>
                     <p className="text-xs font-bold text-gray-900 dark:text-gray-100 transition-colors">All Nodes Operational</p>
                   </div>
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-2"></div>
                </div>
            </header>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {platformCards.map((card, i) => (
                    <motion.div 
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-gradient-to-br ${card.color} p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl transform group-hover:scale-110 transition-transform">
                           {card.icon}
                        </div>
                        <div className="relative z-10 space-y-2">
                           <div className="text-white/80 font-black uppercase text-[10px] tracking-widest">{card.title}</div>
                           <h3 className="text-4xl font-black">{card.value}</h3>
                           <div className="flex items-center text-xs font-bold text-white/60 pt-2">
                              <FiActivity className="mr-1" /> System Live
                           </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Eco Impact Stats - New Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center space-x-4 shadow-sm transition-colors">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-xl"><FiBox /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Total Pickups</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white transition-colors">{stats?.pickups?.totalPickups || 0 || 4}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center space-x-4 shadow-sm transition-colors">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl"><FiActivity /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Recycled Items</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white transition-colors">{stats?.pickups?.recycledItems || 0 || 5} units</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center space-x-4 shadow-sm transition-colors">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-xl"><FiGlobe /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">CO2 Offset</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white transition-colors">{stats?.pickups?.co2Saved || 0} kg</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Pipeline Monitoring */}
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 transition-colors">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter transition-colors">Pickup Pipeline</h3>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Pickup Status Analytics</div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.pickupPipelineStats || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#1E293B', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Material Distribution */}
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 transition-colors">
                   <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter transition-colors">Waste Category Load</h3>
                        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Global Distribution</div>
                    </div>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                  data={stats?.wasteStats || []}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={110}
                                  paddingAngle={8}
                                  nameKey="name"
                                  dataKey="count"
                              >
                                  {(stats?.wasteStats || []).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                  ))}
                              </Pie>
                              <RechartsTooltip 
                                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                              />
                              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase'}} />
                           </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Status Footer */}
            
                
                 <div 
  onClick={downloadReport}
  className="bg-indigo-600 p-8 rounded-[2rem] text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors group"
>
                    <span className="font-black uppercase text-sm tracking-widest group-hover:scale-110 transition-transform">Download Master Report</span>
                 </div>
            
        </div>
    );
};

export default AdminDashboard;
