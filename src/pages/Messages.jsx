import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import {
  FiSearch,
  FiSend,
  FiSmile,
  FiArrowLeft,
  FiCheckCircle,
  FiMoreHorizontal,
} from "react-icons/fi";
import { useNotifications } from "../context/NotificationContext";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const Messages = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = (storedUser.id || storedUser._id)?.toString();
  const { socket, markAllAsRead } = useNotifications();
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadUsers, setUnreadUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await API.get("/users");
        const otherUsers = res.data.filter((u) => {
          const uid = (u._id || u.id)?.toString();
          if (!uid || uid === currentUserId) return false;
          if (storedUser.role === "ngo" && u.role !== "volunteer") return false;
          if (storedUser.role === "volunteer" && u.role !== "ngo") return false;
          return true;
        });

        setUsers(otherUsers);

        const unreadRes = await API.get("/messages/unread");
        setUnreadUsers(unreadRes.data || {});
      } catch (err) {
        console.error("Chat Init Error:", err);
      }
    };

    if (currentUserId) {
      initChat();
    }

    markAllAsRead();
  }, [currentUserId, markAllAsRead, storedUser.role]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data) => {
      if (!data?.senderId) return;
      const senderId = data.senderId.toString();

      if (selectedUser && senderId === (selectedUser._id || selectedUser.id)?.toString()) {
        setMessages((prev) => [...prev, { ...data, createdAt: new Date().toISOString() }]);
        API.put("/messages/read", { otherUserId: senderId });
        setUnreadUsers((prev) => ({ ...prev, [senderId]: 0 }));
      } else {
        setUnreadUsers((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
        const sender = users.find((u) => (u._id || u.id)?.toString() === senderId);
        toast.success(`New message from ${sender?.name || "User"}`, {
          icon: "💬",
          position: "bottom-right",
        });
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [socket, selectedUser, users]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const otherId = (selectedUser._id || selectedUser.id)?.toString();
        const res = await API.get(`/messages/${otherId}`);
        setMessages(res.data);
        await API.put("/messages/read", { otherUserId: otherId });
        setUnreadUsers((prev) => ({ ...prev, [otherId]: 0 }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const receiverId = (selectedUser._id || selectedUser.id).toString();

    try {
      const msgData = { senderId: currentUserId, receiverId, text: message };
      await API.post("/messages", msgData);

      if (socket) {
        socket.emit("sendMessage", msgData);
      }

      setMessages((prev) => [...prev, { ...msgData, createdAt: new Date().toISOString() }]);
      setMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-10rem)] flex bg-white dark:bg-gray-900 rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
      <div
        className={`${
          mobileSidebarOpen ? "flex w-full lg:w-[360px] xl:w-[400px]" : "hidden lg:flex lg:w-[360px] xl:w-[400px]"
        } flex-col border-r border-gray-50 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/60 transition-colors min-w-0`}
      >
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 space-y-4 sm:space-y-5 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
            Messages
          </h1>
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 group-focus-within:text-indigo-600 transition-colors" />
            <input
              placeholder="Search contacts..."
              className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-medium dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const uid = (user._id || user.id)?.toString();
              const isSelected = (selectedUser?._id || selectedUser?.id)?.toString() === uid;
              const unreadCount = unreadUsers[uid] || 0;

              return (
                <motion.button
                  type="button"
                  key={uid}
                  layout
                  onClick={() => {
                    setSelectedUser(user);
                    setShowEmojiPicker(false);
                  }}
                  className={`w-full flex items-center p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[1.75rem] text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-gray-800 shadow-xl shadow-indigo-50 dark:shadow-none border border-indigo-100 dark:border-indigo-900/50"
                      : "hover:bg-white/70 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-base sm:text-lg shadow-inner shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-center gap-3">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white truncate transition-colors">
                        {user.name}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">
                      {user.role}
                    </p>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-center px-4">
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                No matching contacts found.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex-1 min-w-0 flex-col bg-white dark:bg-gray-950 relative transition-colors ${
          mobileSidebarOpen ? "hidden lg:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            <div className="h-20 sm:h-24 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-gray-50 dark:border-gray-800 relative z-20">
              <div className="flex items-center min-w-0 gap-3 sm:gap-4">
                <button
                  type="button"
                  className="lg:hidden text-2xl text-gray-400 dark:text-gray-600 shrink-0"
                  onClick={() => {
                    setMobileSidebarOpen(true);
                    setShowEmojiPicker(false);
                  }}
                >
                  <FiArrowLeft />
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-indigo-100 dark:shadow-none shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-none truncate transition-colors">
                    {selectedUser.name}
                  </h3>
                  <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-widest">
                    Active Chat
                  </span>
                </div>
              </div>
              <div className="flex items-center text-gray-400 shrink-0">
                <FiMoreHorizontal className="text-xl sm:text-2xl hover:text-indigo-600 cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6 space-y-4 sm:space-y-5 bg-gray-50/30 dark:bg-gray-900/20 shadow-inner">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId.toString() === currentUserId;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[88%] sm:max-w-[78%] lg:max-w-[70%] px-4 py-3 sm:px-5 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed break-words transition-all ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-md"
                              : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-md"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <div
                            className={`mt-3 flex items-center gap-2 text-[10px] font-black uppercase ${
                              isMe ? "text-indigo-100" : "text-gray-400"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMe && <FiCheckCircle />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800 transition-colors">
              <form onSubmit={handleSendMessage} className="relative space-y-3">
                <div className="flex items-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shrink-0"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <FiSmile className="text-xl sm:text-2xl" />
                  </button>
                  <input
                    className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-[1.5rem] sm:rounded-[2rem] py-3.5 sm:py-4 px-4 sm:px-6 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none font-bold text-sm sm:text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-3 sm:p-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-xl shadow-gray-200 dark:shadow-none disabled:opacity-50 active:scale-95 shrink-0"
                  >
                    <FiSend className="text-xl sm:text-2xl" />
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 sm:right-auto z-50 shadow-2xl rounded-3xl overflow-hidden w-full sm:w-auto max-w-full">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => setMessage((prev) => prev + emojiData.emoji)}
                      width="100%"
                      height={350}
                      theme={theme === "dark" ? "dark" : "light"}
                    />
                  </div>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:p-10 lg:p-16 text-center space-y-5 sm:space-y-6 bg-white dark:bg-gray-950 transition-colors">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl shadow-inner">
              💬
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Eco Connect
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium max-w-sm">
                Select an NGO or volunteer colleague to start coordinating your waste management projects.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">
              <FiCheckCircle className="text-green-500" />
              <span>End-to-end coordination</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
