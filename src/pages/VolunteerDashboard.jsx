import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiMapPin, FiClock, FiStar, FiArrowRight, FiActivity, FiZap, FiTarget, FiBox } from "react-icons/fi";
import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";

const statsConfig = [
    { title: "Total Pickups", key: "totalPickups", icon: <FiBox />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Items Recycled", key: "recycledItems", icon: <FiZap />, color: "text-green-600", bg: "bg-green-50" },
    { title: "CO2 Saved (kg)", key: "co2Saved", icon: <FiTarget />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Impact Hours", key: "volunteerHours", icon: <FiActivity />, color: "text-orange-600", bg: "bg-orange-50" },
];

const CO2_FACTORS = {
  plastic: 6,
  paper: 3,
  metal: 9,
  glass: 1,
  electronic: 8,
  electronics: 8,
  "electronic waste": 8,
  "e-waste": 8,
  ewaste: 8,
};

const buildVolunteerStatsFromPickups = (pickups = []) => {
  const totalPickups = pickups.length;
  const recycledItems = pickups.reduce(
    (sum, pickup) => sum + (Array.isArray(pickup.wasteTypes) ? pickup.wasteTypes.length : 0),
    0
  );
  const co2Saved = pickups.reduce((sum, pickup) => {
    const pickupCo2 = (pickup.wasteTypes || []).reduce((pickupSum, type) => {
      const normalizedType = type?.toString().trim().toLowerCase();
      return pickupSum + (CO2_FACTORS[normalizedType] || 0);
    }, 0);

    return sum + pickupCo2;
  }, 0);
  const volunteerHours = pickups.filter((pickup) =>
    ["Accepted", "In Progress", "Completed", "Closed"].includes(pickup.status)
  ).length * 2;

  return {
    totalPickups,
    recycledItems,
    co2Saved,
    volunteerHours,
  };
};

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications, socket, fetchNotifications } = useNotifications();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const [dashRes, matchRes, profileRes] = await Promise.all([
        axios.get("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/opportunity/matches/top", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const profileUser = profileRes.data || {};
      const currentUserId = profileUser._id || profileUser.id || storedUser.id || storedUser._id;
      const pickupRes = currentUserId
        ? await axios.get(`/api/pickups/user/${currentUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : { data: [] };

      const volunteerPickups = Array.isArray(pickupRes.data) ? pickupRes.data : [];
      const derivedStats = buildVolunteerStatsFromPickups(volunteerPickups);

      setData({
        ...dashRes.data,
        stats: derivedStats,
        pickups: volunteerPickups.slice(0, 5),
      });
      setTopMatches(Array.isArray(matchRes.data) ? matchRes.data : []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refreshDashboard = () => {
      fetchData({ silent: true });
      fetchNotifications();
    };

    socket.on("newNotification", refreshDashboard);

    return () => {
      socket.off("newNotification", refreshDashboard);
    };
  }, [socket, fetchNotifications]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Assembling your impact data...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const pickups = data?.pickups || [];
  const breakdown = data?.breakdown || [];
  const volunteerApplications = data?.volunteerApplications || [];
  const opportunityNotifications = notifications
    .filter((notification) => notification.type === "opportunity_status")
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 pb-10">
      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Hi, <span className="text-green-600 font-black">{storedUser.name || "Volunteer"}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Here's your environmental impact for this month.</p>
        </div>
        <button 
          onClick={() => navigate("/schedule")}
          className="w-full md:w-auto bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100 dark:shadow-green-900/10 flex items-center justify-center space-x-2 active:scale-95"
        >
          <span>Schedule New Pickup</span>
          <FiArrowRight />
        </button>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center space-y-3 cursor-default hover:shadow-xl dark:hover:shadow-green-900/5 transition-all group"
          >
            <div className={`${stat.bg} ${stat.color} dark:bg-opacity-10 p-4 rounded-2xl text-2xl group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.title}</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stats[stat.key] || 0}</h2>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        {/* ── Matching Opportunities ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-3 tracking-tighter">
              <FiStar className="text-yellow-500" />
              <span>Smart Matches For You</span>
            </h2>
            <button 
              onClick={() => navigate("/opportunities")}
              className="text-green-600 dark:text-green-400 font-black hover:underline text-[10px] uppercase tracking-widest"
            >
              Explore All
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {topMatches.length > 0 ? topMatches.slice(0, 4).map((opp, i) => (
              <motion.div 
                key={opp._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/opportunity/${opp._id}`)}
                className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-green-200 dark:hover:border-green-700 transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {opp.wasteType || "General"}
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-green-600 transition-colors mb-2 line-clamp-1 tracking-tight">
                  {opp.title}
                </h3>
                <p className="text-sm text-gray-400 font-medium line-clamp-2 mb-6 leading-relaxed">
                  {opp.description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400">
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="text-green-500" />
                    <span className="truncate max-w-[120px]">{opp.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-indigo-500" />
                    <span>{opp.duration || "Full Day"}</span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-2 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-12 text-center space-y-3">
                <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs">No active matches found.</p>
                <p className="text-sm text-gray-400">Try updating your location or waste preferences.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Activity ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 self-start space-y-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase tracking-widest text-[10px]">Recent Activity</h2>
          <div className="space-y-6">
            {volunteerApplications.length > 0 ? volunteerApplications.slice(0, 5).map((application) => {
              const isAccepted = application.applicationStatus === "accepted";
              const isRejected = application.applicationStatus === "rejected";

              return (
                <div key={application._id} className="flex items-start space-x-4">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    isAccepted
                      ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      : isRejected
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.35)]"
                        : "bg-yellow-500"
                  }`}></div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-gray-800 dark:text-gray-200 leading-none">
                      {isAccepted ? "Application Accepted" : isRejected ? "Application Rejected" : "Application Pending"}
                    </p>
                    <p className="text-xs text-gray-400 font-medium max-w-[220px]">
                      {application.title} in {application.location}
                    </p>
                  </div>
                </div>
              );
            }) : opportunityNotifications.length > 0 ? opportunityNotifications.map((notification) => {
              const isAccepted = notification.content?.toLowerCase().includes("accepted");
              const isRejected = notification.content?.toLowerCase().includes("rejected");

              return (
                <div key={notification._id} className="flex items-start space-x-4">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    isAccepted
                      ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      : isRejected
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.35)]"
                        : "bg-yellow-500"
                  }`}></div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-gray-800 dark:text-gray-200 leading-none">
                      {isAccepted ? "Application Accepted" : isRejected ? "Application Rejected" : "Application Update"}
                    </p>
                    <p className="text-xs text-gray-400 font-medium max-w-[220px]">{notification.content}</p>
                  </div>
                </div>
              );
            }) : pickups.length > 0 ? pickups.slice(0, 5).map((pickup, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  pickup.status === 'Accepted' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                  pickup.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                <div className="space-y-1">
                  <p className="text-[13px] font-black text-gray-800 dark:text-gray-200 leading-none">
                    {pickup.status === 'Accepted' ? "Pickup Scheduled" : "Pickup Requested"}
                  </p>
                  <p className="text-xs text-gray-400 font-medium truncate max-w-[180px]">{pickup.address}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-xs text-center py-10 font-bold uppercase tracking-widest">No recent activity.</p>
            )}
          </div>

          <div className="pt-8 border-t border-gray-50 dark:border-gray-800">
             <h3 className="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest mb-6">Material Breakdown</h3>
             <div className="space-y-5">
               {(breakdown.length > 0 ? breakdown : [{type: 'Plastic', percent: 65}, {type: 'E-Waste', percent: 25}, {type: 'Paper', percent: 10}]).map((item, i) => (
                 <div key={i} className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">
                     <span>{item.type}</span>
                     <span>{item.percent}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        className="h-full bg-green-500 dark:bg-green-600"
                     />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
