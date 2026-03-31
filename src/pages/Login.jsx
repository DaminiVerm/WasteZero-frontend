import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyLoginOtp } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiShield, FiArrowRight } from "react-icons/fi";

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [step, setStep] = useState(1); // 1 for credentials, 2 for OTP
    const [otp, setOtp] = useState("");
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard");
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(credentials);
            setUserId(res.userId);
            setStep(2);
            toast.success("OTP sent to your email!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid login credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await verifyLoginOtp({ userId, otp });
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));
            toast.success("Welcome back, " + res.user.name);
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "OTP Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { resendOtp } = await import("../services/authService");
            await resendOtp({ userId });
            toast.success("New code sent!");
        } catch (err) {
            toast.error("Failed to resend code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300">
            {/* ILLUSTRATION/TEXT SECTION */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex bg-gradient-to-br from-green-600 to-indigo-700 p-16 flex-col justify-between text-white"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-green-600 font-bold text-xl shadow-xl">W</div>
                    <span className="text-2xl font-bold tracking-tight">WasteZero</span>
                </div>
                <div className="space-y-6">
                    <h1 className="text-6xl font-extrabold leading-tight">Empowering a <br/><span className="text-green-300 underline decoration-indigo-300">Sustainable</span> Future.</h1>
                    <p className="text-xl text-green-50/80 leading-relaxed max-w-lg">Join thousands of volunteers and NGOs in the fight against waste. Manage pickups, track impact, and recycle smarter.</p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <p className="text-3xl font-bold">12k+</p>
                        <p className="text-sm text-green-100">Pickups Managed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <p className="text-3xl font-bold">95%</p>
                        <p className="text-sm text-green-100">Success Rate</p>
                    </div>
                </div>
            </motion.div>

            {/* FORM SECTION */}
            <div className="flex items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div 
                            key="login-form" 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl space-y-8 border border-gray-100 dark:border-gray-800 transition-colors"
                        >
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Sign In</h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Welcome back! Please enter your details.</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-[10px]">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                        <input 
                                            type="email" 
                                            className="w-full border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-green-500 rounded-xl py-4 pl-12 pr-4 outline-none transition-all duration-300 dark:text-white"
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-[10px]">Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                        <input 
                                            type="password" 
                                            className="w-full border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-green-500 rounded-xl py-4 pl-12 pr-4 outline-none transition-all duration-300 dark:text-white"
                                            placeholder="••••••••"
                                            required
                                            autoComplete="current-password"
                                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold py-2">
                                    <label className="flex items-center cursor-pointer space-x-2">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-green-600 focus:ring-green-500 bg-transparent" />
                                        <span className="text-gray-500 dark:text-gray-400">Remember for 30 days</span>
                                    </label>
                                    <span className="text-green-600 dark:text-green-400 font-bold hover:underline cursor-pointer">Forgot password?</span>
                                </div>
                                <button
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-green-700 transition duration-300 shadow-xl shadow-green-200 dark:shadow-none transform hover:-translate-y-1 flex items-center justify-center group"
                                >
                                    {loading ? "Authenticating..." : "Sign In"}
                                    {!loading && <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                            <p className="text-center text-gray-500">
                                Don't have an account? <span onClick={() => navigate("/register")} className="text-indigo-600 font-bold hover:underline cursor-pointer">Sign Up</span>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full max-w-md bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl space-y-8 text-center border border-gray-100 dark:border-gray-800 transition-colors"
                        >
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 text-3xl shadow-inner">
                                <FiShield />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Two-Factor Auth</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Please enter the security code sent to <br/> <strong className="text-indigo-600 dark:text-indigo-400">{credentials.email}</strong></p>
                            </div>
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 rounded-2xl outline-none transition-all"
                                    placeholder="••••••"
                                    required
                                    autoComplete="one-time-code"
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <button className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none transform hover:-translate-y-1">
                                    Verify Code
                                </button>
                                <p className="text-gray-400 text-sm">Didn't receive code? <span onClick={handleResendOtp} className="text-indigo-600 font-bold cursor-pointer underline hover:text-indigo-800 transition-colors">Resend</span></p>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default Login;
