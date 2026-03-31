import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiMapPin, FiCalendar, FiClock, FiTrash2, FiEdit3, FiCheckCircle, FiUser, FiArrowLeft, FiMessageCircle } from "react-icons/fi";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [applied, setApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/opportunity/${id}`);
        setData(res.data);
        
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setRole(storedUser.role);
        setUserId(storedUser.id || storedUser._id);

        const matchingApplication = res.data?.applicants?.find((app) => {
          const applicantId =
            typeof app?.user === "object" ? app.user?._id : app?.user || app;
          return applicantId === (storedUser.id || storedUser._id);
        });

        if (matchingApplication) {
          setApplied(true);
          setApplicationStatus(matchingApplication.status || "pending");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load initiative details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );

  const handleDelete = async () => {
    if (!window.confirm("Permanently remove this opportunity? This cannot be undone.")) return;
    try {
      await API.delete(`/opportunity/${data._id}`);
      toast.success("Post removed successfully");
      navigate("/opportunities");
    } catch (err) {
      toast.error("Process failed.");
    }
  };

  const handleApply = async () => {
    try {
      const res = await API.post(`/opportunity/apply/${data._id}`, {});
      toast.success(res.data.msg || "Application sent! Check your messages.");
      setApplied(true);
      setApplicationStatus("pending");
      setData((prev) => ({
        ...prev,
        applicants: [
          ...(prev?.applicants || []),
          { user: userId, status: "pending" },
        ],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/1200x600?text=WasteZero+Campaign";
    const cleanPath = imagePath.replace(/^\/+/, "");
    return cleanPath.startsWith("uploads") ? `/${cleanPath}` : `/uploads/${cleanPath}`;
  };

  const getApplicationLabel = () => {
    switch (applicationStatus) {
      case "accepted":
        return "Accepted by NGO";
      case "rejected":
        return "Rejected by NGO";
      default:
        return "Application Sent";
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-fade-in">
      <div onClick={() => navigate("/opportunities")} className="flex items-center text-gray-400 font-bold text-sm cursor-pointer hover:text-green-600 mb-4 transition-colors">
         <FiArrowLeft className="mr-2" /> Back to Initiatives
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors"
      >
        <div className="relative h-96 overflow-hidden">
             <img src={getImageUrl(data.image)} alt={data.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
             <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
                <div className="flex items-center space-x-3">
                   <span className="bg-green-500/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {data.wasteType || "General Waste"}
                   </span>
                   <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                      {data.status}
                   </span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-none">{data.title}</h1>
             </div>
        </div>

        <div className="p-12 lg:p-16 grid lg:grid-cols-3 gap-16">
           <div className="lg:col-span-2 space-y-10">
              <section className="space-y-4">
                 <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors">About Phase</h2>
                 <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed whitespace-pre-wrap transition-colors">
                    {data.description}
                 </p>
              </section>

              <div className="grid sm:grid-cols-3 gap-6">
                 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] space-y-1 transition-colors">
                    <p className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest flex items-center"><FiMapPin className="mr-1 text-green-500" /> Location</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{data.location}</p>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] space-y-1 transition-colors">
                    <p className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest flex items-center"><FiCalendar className="mr-1 text-indigo-500" /> Date</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date(data.date).toLocaleDateString()}</p>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] space-y-1 transition-colors">
                    <p className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest flex items-center"><FiClock className="mr-1 text-orange-500" /> Duration</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{data.duration}</p>
                 </div>
              </div>

              <section className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800 transition-colors">
                 <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Required Credentials</h2>
                 <div className="flex flex-wrap gap-3">
                   {(data?.requiredSkills || ["Teamwork", "Sustainability Enthusiast"])
  .toString()
  .split(",")
  .map((skill, index) => (
    <span
      key={index}
      className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-5 py-2 rounded-2xl text-xs font-bold border border-indigo-100 dark:border-indigo-800 transition-colors"
    >
      {skill.trim()}
    </span>
))}
                    
                 </div>
              </section>
           </div>

           <div className="space-y-8">
              <div className="bg-gray-900 dark:bg-[#0c0f18] rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl dark:shadow-none transition-colors">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Participation</h3>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Be part of the solution. Your contribution directly reduces the local carbon footprint.</p>
                 </div>

                 <div className="space-y-4">
                    {role === "volunteer" && (
                        <button 
                            onClick={handleApply}
                            disabled={applied}
                            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95
                                ${applied
                                  ? applicationStatus === "rejected"
                                    ? 'bg-red-500 text-white cursor-default'
                                    : 'bg-green-600 text-white cursor-default'
                                  : 'bg-white text-gray-900 hover:bg-green-500 hover:text-white'}
                            `}
                        >
                            {applied ? <span className="flex items-center justify-center"><FiCheckCircle className="mr-2" /> {getApplicationLabel()}</span> : "Apply for Initiative"}
                        </button>
                    )}

                    {/* UPDATE — ONLY NGO */}
{role === "ngo" && (
  <button
    onClick={() => navigate(`/edit-opportunity/${data._id}`)}
    className="w-full bg-white/10 hover:bg-white/20 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center space-x-2"
  >
    <FiEdit3 /> <span>Update Post</span>
  </button>
)}

{/* DELETE — NGO + ADMIN */}
{(role === "ngo" || role === "admin") && (
  <button
    onClick={handleDelete}
    className="w-full bg-red-500/20 hover:bg-red-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center space-x-2 border border-red-500/30"
  >
    <FiTrash2 /> <span>Terminate Post</span>
  </button>
)}
                    
                    {role === "volunteer" && (
                        <button onClick={() => navigate("/messages")} className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
                            <FiMessageCircle /> <span>Message Creator</span>
                        </button>
                    )}
                 </div>

                 <div className="pt-8 border-t border-white/10 space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Applicants</p>
                    <div className="flex -space-x-3 overflow-hidden">
                        {(data.applicants || [1,2,3]).map((i) => (
                           <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-black">U</div>
                        ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
