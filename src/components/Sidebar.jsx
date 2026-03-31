import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiCalendar,
  FiPlusSquare,
  FiMail,
  FiUser,
  FiShield,
  FiActivity,
} from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role || "volunteer";

  const navItems = [
    { name: "Dashboard", short: "Home", icon: <FiHome />, path: "/dashboard", roles: ["volunteer", "ngo", "admin"] },
    { name: "Opportunities", short: "Explore", icon: <FiSearch />, path: "/opportunities", roles: ["volunteer", "ngo", "admin"] },
    { name: "Schedule Pickup", short: "Pickup", icon: <FiCalendar />, path: "/schedule", roles: ["volunteer"] },
    { name: "Create Opportunity", short: "Create", icon: <FiPlusSquare />, path: "/create-opportunity", roles: ["ngo"] },
    { name: "Messages", short: "Messages", icon: <FiMail />, path: "/messages", roles: ["volunteer", "ngo"] },
    { name: "My Profile", short: "Profile", icon: <FiUser />, path: "/my-profile", roles: ["volunteer", "ngo", "admin"] },
  ];

  const adminItems = [
    { name: "User Management", short: "Users", icon: <FiUser />, path: "/admin/users" },
    { name: "Moderation", short: "Moderate", icon: <FiShield />, path: "/admin/moderation" },
    { name: "System Reports", short: "Reports", icon: <FiActivity />, path: "/admin/reports" },
  ];

  const visibleItems = [
    ...navItems.filter((item) => item.roles.includes(role)),
    ...(role === "admin" ? adminItems : []),
  ];

  const renderDesktopLink = (item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`flex items-center space-x-3 px-6 py-4 transition-all duration-300 group ${
        location.pathname === item.path
          ? "bg-green-600/10 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-r-4 border-green-600"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400"
      }`}
    >
      <span
        className={`text-xl transition-transform group-hover:scale-110 ${
          location.pathname === item.path
            ? "text-green-600 dark:text-green-400"
            : "text-gray-400 dark:text-gray-600 group-hover:text-green-600 dark:group-hover:text-green-400"
        }`}
      >
        {item.icon}
      </span>
      <span className="font-semibold text-sm tracking-wide uppercase">{item.name}</span>
    </Link>
  );

  return (
    <>
      <div className="hidden lg:flex h-full bg-white dark:bg-gray-900 flex-col border-r border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Main Menu</div>
          {navItems.filter((item) => item.roles.includes(role)).map(renderDesktopLink)}

          {role === "admin" && (
            <div className="mt-8">
              <div className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Administration</div>
              {adminItems.map(renderDesktopLink)}
            </div>
          )}
        </nav>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur lg:hidden overflow-x-auto">
        <div className="flex min-w-max gap-1 px-2 py-2">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`min-w-[82px] flex flex-col items-center justify-center rounded-2xl py-2 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname === item.path
                  ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="truncate max-w-full">{item.short}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
