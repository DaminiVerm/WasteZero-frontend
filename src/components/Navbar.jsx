import React from "react";
import { FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

const Navbar = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="fixed top-0 left-0 right-0 min-h-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 px-3 sm:px-6 lg:px-8 py-3 z-50 transition-colors duration-300">
            <div className="flex items-center min-w-0 flex-1 space-x-2 sm:space-x-8">
                <div className="flex items-center min-w-0 space-x-2 text-green-600">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
                    <span className="text-sm sm:text-xl font-black uppercase text-gray-900 dark:text-white truncate">WasteZero</span>
                </div>
            </div>

            <div className="flex items-center flex-shrink-0 gap-2 sm:gap-3 md:gap-4">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl" />}
                </button>

                {/* Notifications */}
                <button
                    type="button"
                    onClick={() => navigate("/notifications")}
                    className="relative group cursor-pointer p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-green-600"
                >
                    <FiBell className="text-xl" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white rounded-full border-2 border-white dark:border-gray-900 text-[10px] font-black flex items-center justify-center animate-pulse">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>

                {/* Profile Section */}
                <div className="relative max-w-[150px] sm:max-w-none">
                    <div 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 sm:px-3 py-2 rounded-2xl transition-all max-w-[150px] sm:max-w-none"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-indigo-100 uppercase overflow-hidden flex-shrink-0">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="hidden md:block min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none truncate">{user?.name || "User Account"}</p>
                            <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-widest">{user?.role || "Volunteer"}</span>
                        </div>
                        <FiChevronDown className={`hidden sm:block text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-[min(16rem,calc(100vw-1.5rem))] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 z-50 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-50 dark:border-gray-700 space-y-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user?.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                </div>
                                <div className="py-2">
                                    <button onClick={() => {navigate("/my-profile"); setDropdownOpen(false)}} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all">
                                        <FiUser /> <span>My Profile</span>
                                    </button>
                                    <button onClick={() => {navigate("/settings"); setDropdownOpen(false)}} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all">
                                        <FiSettings /> <span>Settings</span>
                                    </button>
                                </div>
                                <div className="pt-2 border-t border-gray-50 dark:border-gray-700">
                                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-bold">
                                        <FiLogOut /> <span>Log Out Account</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
