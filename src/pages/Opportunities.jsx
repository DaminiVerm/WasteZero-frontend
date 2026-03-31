import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiPlus, FiMapPin, FiCalendar, FiFilter, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function OpportunitiesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/opportunity", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setRole(user?.role || "");
        setUserId(user?.id || user?._id || "");
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  const filtered = data.filter((item) =>
    (item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())) &&
    (status === "All" || item.status === status)
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400?text=WasteZero+Opportunity";
    const cleanPath = imagePath.replace(/^\/+/, "");
    return cleanPath.startsWith("uploads") ? `/${cleanPath}` : `/uploads/${cleanPath}`;
  };

  const getApplicationStatus = (opportunity) => {
    const applicant = opportunity?.applicants?.find((app) => {
      const applicantUser =
        typeof app?.user === "object" ? app.user?._id : app?.user || app;
      return applicantUser === userId;
    });

    return applicant?.status || null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Recycling Initiatives</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Browse and join community-driven waste management projects.</p>
        </div>

        {role === "ngo" && (
          <button
            onClick={() => navigate("/create-opportunity")}
            className="w-full md:w-auto bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100 dark:shadow-green-900/10 flex items-center justify-center space-x-2 active:scale-95"
          >
            <FiPlus className="text-xl" />
            <span>Post Opportunity</span>
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="relative flex-1 group">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by title, description, or waste type..."
            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none font-medium dark:text-white"
            value={search}
            name="search"
            autoComplete="on"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center space-x-2 text-gray-400">
            <FiFilter />
            <span className="text-xs font-black uppercase tracking-widest leading-none">Status</span>
          </div>
          <select
            className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-green-500 transition-all outline-none font-bold text-gray-700 dark:text-gray-200 appearance-none cursor-pointer pr-12"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open Now</option>
            <option value="Closed">Past</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 h-80 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((o, idx) => {
                const applicationStatus = getApplicationStatus(o);
                const isApplied = Boolean(applicationStatus);

                return (
                  <motion.div
                    key={o._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/opportunity/${o._id}`)}
                    className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-green-200 dark:hover:border-green-700 transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getImageUrl(o.image)}
                        alt={o.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {isApplied && (
                        <div className={`absolute top-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-xl border border-white/20 dark:border-gray-700 ${
                          applicationStatus === "accepted"
                            ? "text-green-600 dark:text-green-400"
                            : applicationStatus === "rejected"
                              ? "text-red-500 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                        }`}>
                          <FiCheckCircle className="text-lg" />
                          <span className="text-xs font-black uppercase tracking-widest leading-none">{applicationStatus}</span>
                        </div>
                      )}

                      <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 font-bold text-sm">
                        View Details <FiArrowRight className="inline-block ml-2" />
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex-1 flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {o.wasteType || "Community"}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${o.status === "Open" ? "text-green-500" : "text-red-400"}`}>
                          {o.status}
                        </span>
                      </div>

                      {applicationStatus && (
                        <div className={`inline-flex self-start px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          applicationStatus === "accepted"
                            ? "bg-green-50 text-green-700"
                            : applicationStatus === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {applicationStatus === "accepted"
                            ? "Accepted by NGO"
                            : applicationStatus === "rejected"
                              ? "Rejected by NGO"
                              : "Pending NGO review"}
                        </div>
                      )}

                      <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-green-600 transition-colors">
                        {o.title}
                      </h2>

                      <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed">
                        {o.description}
                      </p>

                      <div className="pt-4 mt-auto border-t border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-gray-400">
                        <div className="flex items-center space-x-2 min-w-0">
                          <FiMapPin className="text-green-500 text-lg" />
                          <span className="truncate max-w-[120px]">{o.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-indigo-500 text-lg" />
                          <span>{new Date(o.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-32 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="text-6xl text-gray-100 flex justify-center"><FiSearch /></div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-gray-400">No matching projects found.</p>
                  <p className="text-sm text-gray-300">Try adjusting your filters or search keywords.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
