import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const NotificationContext = createContext();
const backendUrl = "https://wastezero-smart-waste-platform.onrender.com";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/notifications");
      setNotifications(data);
    } catch (error) {
      console.log("Fetch notifications error:", error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
       const { data } = await axios.get("/api/notifications/unread-count");
       setUnreadCount(data.count);
    } catch (error) {
       console.log("Fetch unread count error:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchNotifications();
      fetchUnreadCount();

      const newSocket = io(backendUrl);
      setSocket(newSocket);

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        newSocket.emit("addUser", user._id || user.id);
      }

      newSocket.on("newNotification", () => {
        fetchNotifications();
        fetchUnreadCount();
      });

      return () => newSocket.close();
    }
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
    } catch (error) {
       console.log("Mark as read error:", error);
       fetchNotifications();
       fetchUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/read-all");
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
       console.log("Mark all as read error:", error);
       fetchNotifications();
       fetchUnreadCount();
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications((currentNotifications) => {
        const deletedNotification = currentNotifications.find(
          (notification) => notification._id === id
        );

        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
        }

        return currentNotifications.filter(
          (notification) => notification._id !== id
        );
      });
    } catch (error) {
      console.log("Delete notification error:", error);
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        socket,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
