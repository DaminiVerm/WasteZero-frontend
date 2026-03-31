import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiTerminal, FiCheckCircle } from "react-icons/fi";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "volunteer"
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...data } = formData;
            const res = await registerUser(data);
            localStorage.setItem("otpUserId", res.userId);
            localStorage.setItem("otpType", "register");
            toast.success("Verification code sent to your email!");
            navigate("/verify-register-otp");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full grid lg:grid-cols-2 bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300"
            >
                {/* INFO SECTION */}
                <div className="hidden lg:flex bg-green-600 p-12 flex-col justify-center relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
                    <h2 className="text-4xl font-extrabold text-white mb-6 z-10">Start Your Sustainability Journey.</h2>
                    <ul className="space-y-6 text-green-100 z-10 text-lg">
                        <li className="flex items-center"><FiCheckCircle className="mr-3 text-white text-xl" /> Flexible Volunteer Schedules</li>
                        <li className="flex items-center"><FiCheckCircle className="mr-3 text-white text-xl" /> Real-time Waste Tracking</li>
                        <li className="flex items-center"><FiCheckCircle className="mr-3 text-white text-xl" /> Community Impact Reports</li>
                        <li className="flex items-center"><FiCheckCircle className="mr-3 text-white text-xl" /> Direct NGO Connectivity</li>
                    </ul>
                </div>

                {/* FORM SECTION */}
                <div className="p-12 bg-white dark:bg-gray-900 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Sign Up</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">Create your credentials to join</p>
                        </div>
                        <div onClick={() => navigate("/login")} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-all active:scale-95 shadow-sm">Log In Instead</div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        className="w-full bg-gray-100 dark:bg-gray-800 dark:text-white border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none" 
                                        placeholder="John Doe"
                                        required
                                        autoComplete="name"
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Username</label>
                                <div className="relative">
                                    <FiTerminal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none" 
                                        placeholder="johndoe1"
                                        required
                                        autoComplete="username"
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email"
                                    className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none" 
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none" 
                                        required
                                        autoComplete="new-password"
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Confirm</label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none" 
                                        required
                                        autoComplete="new-password"
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">I want to join as a:</label>
                            <div className="grid grid-cols-3 gap-3">
                                {["volunteer", "ngo", "admin"].map(role => (
                                    <div 
                                        key={role}
                                        onClick={() => setFormData({...formData, role})}
                                        className={`py-3 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border-2
                                            ${formData.role === role ? 'bg-green-600 text-white border-green-600 shadow-xl shadow-green-100 dark:shadow-none scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}
                                        `}
                                    >
                                        {role}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none mt-6 active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>{loading ? "Processing Hub Access..." : "Establish Identity"}</span>
                            {!loading && <FiCheckCircle />}
                        </button>

                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
