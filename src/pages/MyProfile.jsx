import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "",
    skills: ""   // displayed as comma-separated string in the input
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        location: res.data.location || "",
        skills: Array.isArray(res.data.skills)
          ? res.data.skills.join(", ")
          : res.data.skills || ""
      }))
      .catch(() => toast.error("Failed to load profile"));
  }, [token]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await axios.put(
        "/api/users/me",
        { ...profile, skills: skillsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      await axios.put(
        "/api/users/change-password",
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch {
      toast.error("Password change failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-gray-900 shadow-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 transition-colors">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Security & Profile</h1>

      {/* Tabs */}
      <div className="flex mb-10 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-8 py-4 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${
            activeTab === "profile"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Profile Details
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`px-8 py-4 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${
            activeTab === "password"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Security Access
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileUpdate} className="space-y-6">

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              value={profile.name}
              onChange={e =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              Registered Email
            </label>
            <input
              type="email"
              disabled
              className="w-full bg-gray-100 dark:bg-gray-800/50 dark:text-gray-500 border-none p-4 rounded-2xl font-bold cursor-not-allowed opacity-70"
              value={profile.email}
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              Primary Location
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              value={profile.location}
              onChange={e =>
                setProfile({ ...profile, location: e.target.value })
              }
            />
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              Expertise & Skills
            </label>
            <input
              type="text"
              placeholder="e.g. Recycling, Community Work, Awareness Campaigns"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              value={profile.skills}
              onChange={e =>
                setProfile({ ...profile, skills: e.target.value })
              }
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest mt-2 pl-1">
              Separate multiple skills with commas
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition active:scale-95"
          >
            Update Profile
          </button>
        </form>
      )}

      {/* PASSWORD TAB */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="space-y-6">

          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              Current Access Key
            </label>
            <input
              type="password"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all"
              value={passwordData.currentPassword}
              onChange={e =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })
              }
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              New Access Key
            </label>
            <input
              type="password"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all"
              value={passwordData.newPassword}
              onChange={e =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })
              }
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              Verify Access Key
            </label>
            <input
              type="password"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border-none p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all"
              value={passwordData.confirmPassword}
              onChange={e =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value
                })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition active:scale-95"
          >
            Rotate Password
          </button>
        </form>
      )}
    </div>
  );
}
