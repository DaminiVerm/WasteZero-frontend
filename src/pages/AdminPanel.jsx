import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiUsers, FiMessageCircle, FiShield, FiAlertTriangle,
  FiTrash2, FiSlash, FiCheck, FiSearch, FiGrid, FiCalendar
} from "react-icons/fi";

const token = () => localStorage.getItem("token");

const ROLE_COLORS = {
  admin: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  ngo: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  volunteer: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // "overview" | "users"

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get("/api/users/admin/stats", { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get("/api/users/admin/all-users", { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSuspend = async (userId, name, isSuspended) => {
    try {
      const res = await axios.put(`/api/users/admin/suspend/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      toast.success(`${name} ${res.data.isSuspended ? "suspended" : "unsuspended"}`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: res.data.isSuspended } : u));
      setStats(prev => prev ? {
        ...prev,
        suspendedUsers: res.data.isSuspended ? prev.suspendedUsers + 1 : prev.suspendedUsers - 1
      } : prev);
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/users/admin/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      toast.success(`${name} deleted`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <FiShield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Platform Control Center</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b dark:border-gray-700">
          {[
            { id: "overview", label: "Overview", icon: <FiGrid /> },
            { id: "users", label: "User Management", icon: <FiUsers /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<FiUsers />} label="Total Users" value={stats.totalUsers} color="purple" />
              <StatCard icon={<FiUsers />} label="Volunteers" value={stats.volunteers} color="green" />
              <StatCard icon={<FiGrid />} label="NGOs" value={stats.ngos} color="blue" />
              <StatCard icon={<FiAlertTriangle />} label="Suspended" value={stats.suspendedUsers} color="red" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard icon={<FiMessageCircle />} label="Total Messages" value={stats.totalMessages} color="indigo" />
              <StatCard icon={<FiGrid />} label="Opportunities" value={stats.totalOpportunities} color="blue" />
              <StatCard icon={<FiCalendar />} label="Pickups Scheduled" value={stats.totalPickups} color="green" />
            </div>

            {/* Role Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-5 text-lg">Role Distribution</h2>
              <div className="space-y-4">
                {[
                  { label: "Volunteers", value: stats.volunteers, total: stats.totalUsers, color: "bg-green-500" },
                  { label: "NGOs", value: stats.ngos, total: stats.totalUsers, color: "bg-blue-500" },
                  { label: "Admins", value: stats.admins, total: stats.totalUsers, color: "bg-purple-500" },
                ].map(({ label, value, total, color }) => {
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">
                        <span>{label}</span>
                        <span>{value} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* USER MANAGEMENT TAB */}
        {tab === "users" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2">
                {["all", "volunteer", "ngo", "admin"].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRole(r)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      filterRole === r
                        ? "bg-purple-600 text-white shadow"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border dark:border-gray-700 hover:border-purple-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* User Count */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing <span className="font-bold text-gray-800 dark:text-gray-200">{filtered.length}</span> users
            </p>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="text-left px-5 py-3.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">User</th>
                      <th className="text-left px-5 py-3.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Role</th>
                      <th className="text-left px-5 py-3.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Joined</th>
                      <th className="text-right px-5 py-3.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {filtered.map(user => (
                      <tr
                        key={user._id}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                          user.isSuspended ? "opacity-60 bg-red-50/30 dark:bg-red-900/10" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${
                              user.role === "admin" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400" :
                              user.role === "ngo" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" :
                              "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                            }`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${ROLE_COLORS[user.role]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {user.isSuspended ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 tracking-wider">
                              <FiSlash className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 tracking-wider">
                              <FiCheck className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4">
                          {user.role !== "admin" && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSuspend(user._id, user.name, user.isSuspended)}
                                title={user.isSuspended ? "Unsuspend" : "Suspend"}
                                className={`p-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1 ${
                                  user.isSuspended
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200"
                                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200"
                                }`}
                              >
                                {user.isSuspended ? <FiCheck className="w-4 h-4" /> : <FiSlash className="w-4 h-4" />}
                                <span className="text-xs hidden sm:inline">{user.isSuspended ? "Restore" : "Suspend"}</span>
                              </button>
                              <button
                                onClick={() => handleDelete(user._id, user.name)}
                                title="Delete User"
                                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-all flex items-center gap-1"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span className="text-xs hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          )}
                          {user.role === "admin" && (
                            <span className="text-xs text-gray-400 dark:text-gray-600 text-right block">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-gray-400">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-extrabold">{value ?? "—"}</p>
      <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{label}</p>
    </div>
  );
}
