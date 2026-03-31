import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiPlus, FiUsers, FiTrendingUp, FiGlobe, FiLayers, FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";

const NGOStatsConfig = [
  { title: "Active Opportunities", key: "activeOpportunities", icon: <FiLayers />, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Total Volunteers", key: "totalVolunteers", icon: <FiUsers />, color: "text-green-600", bg: "bg-green-50" },
  { title: "Completed Pickups", key: "completedPickups", icon: <FiTrendingUp />, color: "text-indigo-600", bg: "bg-indigo-50" },
  { title: "Pending Pickups", key: "pendingPickups", icon: <FiGlobe />, color: "text-orange-600", bg: "bg-orange-50" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useNotifications();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const res = await axios.get("/api/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("NGO Dashboard error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refreshApplications = () => {
      fetchData({ silent: true });
    };

    socket.on("newNotification", refreshApplications);

    return () => {
      socket.off("newNotification", refreshApplications);
    };
  }, [socket]);

  const formatStatus = (status) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";

  const getStatusClasses = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700 border border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-orange-50 text-orange-700 border border-orange-200";
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString();
  };

  const getSkillsText = (skills) => {
    if (!skills) return "No specific skills listed";
    if (Array.isArray(skills)) return skills.length ? skills.join(", ") : "No specific skills listed";
    return skills.toString() || "No specific skills listed";
  };

  const handleDecision = async (oppId, volunteerId, status) => {
    try {
      await axios.put(
        `/api/opportunity/application/${oppId}/${volunteerId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setData((prev) => ({
        ...prev,
        applications: (prev?.applications || []).map((opp) =>
          opp._id !== oppId
            ? opp
            : {
                ...opp,
                applicants: opp.applicants.map((applicant) => {
                  const applicantUser = applicant?.user || applicant;
                  const applicantId = applicantUser?._id || applicantUser;

                  return applicantId === volunteerId
                    ? { ...applicant, status }
                    : applicant;
                }),
              }
        ),
      }));

      toast.success(`Application ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update application");
    }
  };

  const handlePickupAccept = async (pickupId) => {
    try {
      await axios.put(
        `/api/pickups/${pickupId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setData((prev) => ({
        ...prev,
        pickups: (prev?.pickups || []).map((pickup) =>
          pickup._id === pickupId
            ? { ...pickup, status: "Accepted" }
            : pickup
        ),
        stats: {
          ...(prev?.stats || {}),
          pendingPickups: Math.max(((prev?.stats || {}).pendingPickups || 0) - 1, 0),
        },
      }));

      toast.success("Pickup accepted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept pickup");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading NGO analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const pickups = data?.pickups || [];
  const breakdown = data?.breakdown || [];
  const applications = data?.applications || [];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">NGO Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">Empowering {storedUser.name} to change the world.</p>
        </div>
        <button
          onClick={() => navigate("/create-opportunity")}
          className="w-full md:w-auto bg-indigo-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-900/10 flex items-center justify-center space-x-3 active:scale-95"
        >
          <FiPlus className="text-xl" />
          <span>Launch New Initiative</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {NGOStatsConfig.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-xl transition-all"
          >
            <div className={`${stat.bg} ${stat.color} dark:bg-opacity-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.title}</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stats[stat.key] || 0}</h2>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 sm:p-8 border-b">
          <h2 className="text-xl font-black">Volunteer Applications</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {applications.length > 0 ? applications.map((opp) => (
            <div key={opp._id} className="border rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-lg">{opp.title}</h3>
                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">
                    {opp.status || "Open"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {opp.location} • {formatDate(opp.date)} • {opp.duration || "Duration not set"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Waste Type</p>
                    <p className="text-gray-700 mt-1 font-semibold">{opp.wasteType || "General Waste"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Required Skills</p>
                    <p className="text-gray-700 mt-1 font-semibold">{getSkillsText(opp.requiredSkills)}</p>
                  </div>
                </div>
                {opp.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{opp.description}</p>
                )}
              </div>

              {opp.applicants.map((applicant) => {
                const applicantUser = applicant?.user || applicant;
                const applicantId = applicantUser?._id || applicantUser;
                const applicantStatus = applicant?.status || "pending";

                return (
                  <div
                    key={applicantId}
                    className="bg-gray-50 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-700">{applicantUser?.name || "Volunteer"}</p>
                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusClasses(applicantStatus)}`}
                      >
                        {formatStatus(applicantStatus)}
                      </span>
                    </div>

                    {applicantStatus === "pending" && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Action</p>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecision(opp._id, applicantId, "accepted")}
                            disabled={applicantStatus === "accepted"}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold"
                          >
                            Accept Application
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(opp._id, applicantId, "rejected")}
                            disabled={applicantStatus === "rejected"}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold"
                          >
                            Reject Application
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )) : (
            <p className="text-gray-400 text-center">
              No volunteer applications yet
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-5 sm:p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center space-x-3 tracking-tight">
              <FiList className="text-indigo-600 dark:text-indigo-400" />
              <span>Pending Pickup Requests</span>
            </h2>
            <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-4">Requester</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4">Material</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {pickups.length > 0 ? pickups.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                          {p.date?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{p.address.split(",")[0]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-400 font-medium truncate max-w-[150px]">{p.address}</td>
                    <td className="px-8 py-5 font-black text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-widest">{Array.isArray(p.wasteTypes) && p.wasteTypes.length ? p.wasteTypes.join(", ") : "General Waste"}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        p.status === "Accepted"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {p.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => handlePickupAccept(p._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                        >
                          Accept
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      No pending requests to manage.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all">
            <h3 className="text-xl font-bold">Material Impact</h3>

            <div className="space-y-6 pt-4">
              {breakdown.length > 0 ? breakdown.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300">
                    <span>{item.type}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      className="h-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                    />
                  </div>
                </div>
              )) : (
                <p className="text-indigo-400 text-xs text-center py-4">No data available yet.</p>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
