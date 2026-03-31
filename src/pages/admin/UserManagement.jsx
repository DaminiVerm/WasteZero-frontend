import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiCheckCircle, FiSlash, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/admin/users/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.msg);
      fetchUsers();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-10 bg-white dark:bg-gray-900 min-h-full rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center tracking-tighter">
            <FiShield className="mr-3 text-green-600" /> User Management
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Access Control & Moderation</p>
        </div>
        <div className="relative group w-full md:w-80">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning database...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-4 py-6">User Profile</th>
                <th className="px-4 py-6">Role</th>
                <th className="px-4 py-6">Status</th>
                <th className="px-4 py-6 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="px-4 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white tracking-tight">{user.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    {user.isSuspended ? (
                      <span className="flex items-center text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></span> Suspended
                      </span>
                    ) : user.isVerified ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></span> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-500 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></span> Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-6 text-right">
                    <button 
                      onClick={() => toggleStatus(user._id)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.isSuspended
                          ? "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white"
                          : "bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white"
                      }`}
                    >
                      {user.isSuspended ? "Activate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
              No users found matching your search.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;
