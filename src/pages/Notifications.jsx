import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { FiBell, FiMessageCircle, FiTruck, FiGrid } from "react-icons/fi";
import { format } from "timeago.js";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <FiMessageCircle className="text-blue-500" />;
      case "pickup_status":
        return <FiTruck className="text-green-500" />;
      case "opportunity_status":
        return <FiGrid className="text-purple-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-10 transition-colors">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center tracking-tighter">
            <FiBell className="mr-4 text-green-500" /> Notifications
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Stay updated with the latest activity on the platform.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 border border-gray-100 dark:border-gray-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition-all active:scale-95"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[75vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiBell size={64} className="mx-auto mb-4 opacity-10" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`flex items-start gap-6 p-8 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 group ${
                  n.isRead ? "" : "bg-green-50/30 dark:bg-green-900/10"
                }`}
              >
                <div className={`p-4 rounded-2xl shadow-sm border transition-all ${
                    n.isRead ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500" : "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/20"
                }`}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <p className={`text-base tracking-tight ${n.isRead ? "text-gray-600 dark:text-gray-400 font-medium" : "text-gray-900 dark:text-white font-black"}`}>
                      {n.content}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      {!n.isRead && (
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full mt-2 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></span>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNotification(n._id);
                        }}
                        className="px-4 py-2 rounded-xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500">
                    {format(n.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
