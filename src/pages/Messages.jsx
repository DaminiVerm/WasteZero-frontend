import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { FiSearch, FiSend, FiUser, FiMessageCircle, FiSmile, FiMoreVertical, FiTrash2, FiArrowLeft, FiCheckCircle, FiMoreHorizontal } from "react-icons/fi";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const Messages = () => {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = (storedUser.id || storedUser._id)?.toString();
    const { socket, markAllAsRead } = useNotifications();
    const { theme } = useTheme(); // 🟢 Import useTheme from context/ThemeContext if not available

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState({});
    const [unreadUsers, setUnreadUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

    const scrollRef = useRef();

    // ── Load Users & Initial Data ────────────────────────────────
    useEffect(() => {
        const initChat = async () => {
            try {
                const res = await API.get("/users");
                const otherUsers = res.data.filter(u => {
                    const uid = (u._id || u.id)?.toString();
                    if (!uid || uid === currentUserId) return false;
                    // Filter based on role interaction rules
                    if (storedUser.role === 'ngo' && u.role !== 'volunteer') return false;
                    if (storedUser.role === 'volunteer' && u.role !== 'ngo') return false;
                    return true;
                });
                setUsers(otherUsers);
                setFilteredUsers(otherUsers);

                const unreadRes = await API.get("/messages/unread");
                setUnreadUsers(unreadRes.data || {});
            } catch (err) {
                console.error("Chat Init Error:", err);
            }
        };
        if (currentUserId) initChat();
        markAllAsRead();
    }, [currentUserId]);

    // ── Socket Listening ─────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const handleReceive = (data) => {
            if (!data?.senderId) return;
            const senderId = data.senderId.toString();

            if (selectedUser && (senderId === (selectedUser._id || selectedUser.id)?.toString())) {
                setMessages(prev => [...prev, { ...data, createdAt: new Date().toISOString() }]);
                API.put("/messages/read", { otherUserId: senderId });
                setUnreadUsers(prev => ({ ...prev, [senderId]: 0 }));
            } else {
                setUnreadUsers(prev => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
                const sender = users.find(u => (u._id || u.id)?.toString() === senderId);
                toast.success(`New message from ${sender?.name || 'User'}`, { icon: '💬', position: 'bottom-right' });
            }
        };
        socket.on("receiveMessage", handleReceive);
        return () => socket.off("receiveMessage", handleReceive);
    }, [socket, selectedUser, users]);

    // ── Load History ─────────────────────────────────────────────
    useEffect(() => {
        if (!selectedUser) return;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const otherId = (selectedUser._id || selectedUser.id)?.toString();
                const res = await API.get(`/messages/${otherId}`);
                setMessages(res.data);
                await API.put("/messages/read", { otherUserId: otherId });
                setUnreadUsers(prev => ({ ...prev, [otherId]: 0 }));
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchHistory();
        if (window.innerWidth < 768) setMobileSidebarOpen(false);
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
            socket.emit("sendMessage", msgData);
            setMessages(prev => [...prev, { ...msgData, createdAt: new Date().toISOString() }]);
            setMessage("");
            setShowEmojiPicker(false);
        } catch (error) { console.error(error); }
    };

    const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            {/* Sidebar */}
            <div className={`${mobileSidebarOpen ? 'w-full lg:w-[400px]' : 'hidden lg:flex lg:w-[400px]'} flex flex-col border-r border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 transition-colors`}>
                <div className="p-8 pb-4 space-y-6">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Messages</h1>
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

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => {
                        const uid = (user._id || user.id)?.toString();
                        const isSelected = (selectedUser?._id || selectedUser?.id)?.toString() === uid;
                        const unreadCount = unreadUsers[uid] || 0;

                        return (
                            <motion.div 
                                key={uid}
                                layout
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center p-4 rounded-3xl cursor-pointer transition-all ${isSelected ? 'bg-white dark:bg-gray-800 shadow-xl shadow-indigo-50 dark:shadow-none border border-indigo-100 dark:border-indigo-900/50' : 'hover:bg-white/50 dark:hover:bg-gray-800/30'}`}
                            >
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="ml-4 flex-1 min-w-0 pr-2">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white truncate transition-colors">{user.name}</h3>
                                        {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">{unreadCount}</span>}
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">{user.role}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-gray-950 relative ${!mobileSidebarOpen ? 'flex' : 'hidden lg:flex'} transition-colors`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-24 px-8 flex items-center justify-between border-b border-gray-50 dark:border-gray-800 relative z-20">
                            <div className="flex items-center space-x-4">
                                <FiArrowLeft className="lg:hidden text-2xl mr-2 text-gray-400 dark:text-gray-600" onClick={() => setMobileSidebarOpen(true)} />
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 dark:shadow-none">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none transition-colors">{selectedUser.name}</h3>
                                    <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-widest">Active Chat</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 text-gray-400">
                                <FiMoreHorizontal className="text-2xl hover:text-indigo-600 cursor-pointer transition-colors" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gray-50/20 dark:bg-gray-900/20 shadow-inner">
                            <AnimatePresence>
                                {messages.map((msg, i) => {
                                    const isMe = msg.senderId.toString() === currentUserId;
                                    return (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] p-5 px-8 rounded-[2.5rem] shadow-sm text-sm font-medium leading-relaxed transition-all ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                                <p>{msg.text}</p>
                                                <div className={`mt-3 flex items-center space-x-2 text-[10px] font-black uppercase ${isMe ? 'text-indigo-100' : 'text-gray-400'}`}>
                                                    <span>{formatTime(msg.createdAt)}</span>
                                                    {isMe && <FiCheckCircle />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800 transition-colors">
                            <form onSubmit={handleSendMessage} className="relative flex items-center space-x-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <FiSmile className="text-2xl" />
                                </div>
                                <input 
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 dark:text-white border-none rounded-[2rem] py-4 px-8 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    placeholder="Type your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <button 
                                    disabled={!message.trim()}
                                    className="p-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-xl shadow-gray-200 dark:shadow-none disabled:opacity-50 active:scale-95"
                                >
                                    <FiSend className="text-2xl" />
                                </button>
                                
                                {showEmojiPicker && (
                                    <div className="absolute bottom-24 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden">
                                        <EmojiPicker 
                                            onEmojiClick={(e) => setMessage(p => p + e.emoji)} 
                                            width={350} 
                                            height={400} 
                                            theme={theme === 'dark' ? 'dark' : 'light'}
                                        />
                                    </div>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6 bg-white dark:bg-gray-950 transition-colors">
                        <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner transition-transform hover:scale-110">
                           ♻️
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Eco Connect</h2>
                           <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm">Select an NGO or Volunteer colleague to start coordinating your waste management projects.</p>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                           <FiCheckCircle className="text-green-500" />
                           <span>End-to-End Encrypted Coordination</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;