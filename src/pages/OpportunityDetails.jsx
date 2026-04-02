import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { buildImageUrl, getImageFallback } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiTrash2,
  FiEdit3,
  FiCheckCircle,
  FiUser,
  FiArrowLeft,
  FiMessageCircle,
} from "react-icons/fi";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
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
        setErrorMessage("");

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
        const message = err?.response?.data?.msg || err?.response?.data?.message || "Failed to load initiative details";
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Permanently remove this opportunity? This cannot be undone.")) {
      return;
    }

    try {
      await API.delete(`/opportunity/${data._id}`);
      toast.success("Post removed successfully");
      navigate("/opportunities");
    } catch (err) {
      toast.error("Process failed.");
    }
  };

  const handleStatusToggle = async () => {
    if (!data?._id) return;

    const nextStatus = data.status === "Closed" ? "Open" : "Closed";

    try {
      const res = await API.put(`/opportunity/${data._id}`, {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        duration: data.duration,
        wasteType: data.wasteType,
        requiredSkills: Array.isArray(data.requiredSkills)
          ? data.requiredSkills.join(", ")
          : data.requiredSkills || "",
        status: nextStatus,
      });

      setData(res.data);
      toast.success(`Opportunity ${nextStatus === "Closed" ? "closed" : "reopened"} successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update opportunity status");
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
        applicants: [...(prev?.applicants || []), { user: userId, status: "pending" }],
      }));
    } catch (err) {
      console.error(err);
    }
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

  const skills = (data?.requiredSkills || ["Teamwork", "Sustainability Enthusiast"])
    .toString()
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 sm:p-10 text-center space-y-5">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Opportunity not found</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {errorMessage || "This opportunity may have been removed or the link may be invalid."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/opportunities")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-xs sm:text-sm"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 lg:py-6 space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      <button
        type="button"
        onClick={() => navigate("/opportunities")}
        className="inline-flex items-center text-gray-400 font-bold text-xs sm:text-sm hover:text-green-600 transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Back to Initiatives
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-[2rem] sm:rounded-[2.75rem] lg:rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors"
      >
        <div className="relative min-h-[19rem] sm:min-h-[24rem] lg:h-96 overflow-hidden">
          <img
            src={buildImageUrl(data.image)}
            alt={data.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getImageFallback(data.title || "WasteZero Campaign");
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-12 text-white space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="bg-green-500/90 backdrop-blur-md px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">
                {data.wasteType || "General Waste"}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/20">
                {data.status}
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-[0.95] sm:leading-none break-words">
              {data.title}
            </h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.95fr)] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16">
          <div className="space-y-8 sm:space-y-10">
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors">
                About Phase
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap transition-colors break-words">
                {data.description}
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] space-y-1 transition-colors min-w-0">
                <p className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest flex items-center">
                  <FiMapPin className="mr-1 text-green-500" />
                  Location
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 break-words">
                  {data.location}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] space-y-1 transition-colors min-w-0">
                <p className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest flex items-center">
                  <FiCalendar className="mr-1 text-indigo-500" />
                  Date
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {new Date(data.date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] space-y-1 transition-colors min-w-0 sm:col-span-2 xl:col-span-1">
                <p className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest flex items-center">
                  <FiClock className="mr-1 text-orange-500" />
                  Duration
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{data.duration}</p>
              </div>
            </div>

            <section className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800 transition-colors">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Required Credentials
              </h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 sm:px-5 py-2 rounded-2xl text-[11px] sm:text-xs font-bold border border-indigo-100 dark:border-indigo-800 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="bg-gray-900 dark:bg-[#0c0f18] rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[2.5rem] p-5 sm:p-7 lg:p-8 text-white space-y-6 sm:space-y-8 shadow-2xl dark:shadow-none transition-colors">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">Participation</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                  Be part of the solution. Your contribution directly reduces the local carbon footprint.
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {role === "volunteer" && (
                  <button
                    onClick={handleApply}
                    disabled={applied}
                    className={`w-full min-h-14 px-4 py-4 rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs sm:text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center text-center ${
                      applied
                        ? applicationStatus === "rejected"
                          ? "bg-red-500 text-white cursor-default"
                          : "bg-green-600 text-white cursor-default"
                        : "bg-white text-gray-900 hover:bg-green-500 hover:text-white"
                    }`}
                  >
                    {applied ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiCheckCircle className="shrink-0" />
                        <span>{getApplicationLabel()}</span>
                      </span>
                    ) : (
                      "Apply for Initiative"
                    )}
                  </button>
                )}

                {(role === "ngo" || role === "admin") && (
                  <div className="grid gap-3">
                    {role === "ngo" && (
                      <button
                        onClick={() => navigate(`/edit-opportunity/${data._id}`)}
                        className="w-full min-h-14 px-4 py-4 bg-white/10 hover:bg-white/20 text-white rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center"
                      >
                        <FiEdit3 className="shrink-0" />
                        <span>Update Post</span>
                      </button>
                    )}

                    <button
                      onClick={handleStatusToggle}
                      className="w-full min-h-14 px-4 py-4 bg-amber-500/20 hover:bg-amber-500 text-white rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-amber-400/30 text-center"
                    >
                      <span>{data.status === "Closed" ? "Reopen Post" : "Close Post"}</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      className="w-full min-h-14 px-4 py-4 bg-red-500/20 hover:bg-red-500 text-white rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-red-500/30 text-center"
                    >
                      <FiTrash2 className="shrink-0" />
                      <span>Terminate Post</span>
                    </button>
                  </div>
                )}

                {role === "volunteer" && (
                  <button
                    onClick={() => navigate("/messages")}
                    className="w-full min-h-14 px-4 py-4 bg-white/5 border border-white/10 text-white rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs sm:text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <FiMessageCircle className="shrink-0" />
                    <span>Message Creator</span>
                  </button>
                )}
              </div>

              <div className="pt-6 sm:pt-8 border-t border-white/10 space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Active Applicants
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data.applicants || [1, 2, 3]).map((applicant, index) => (
                    <div
                      key={typeof applicant === "object" ? `${applicant.user || index}-${index}` : applicant}
                      className="inline-flex h-10 w-10 rounded-full ring-2 ring-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-black"
                    >
                      <FiUser className="text-sm" />
                    </div>
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
