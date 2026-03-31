import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyRegisterOtp, verifyLoginOtp, resendOtp } from "../services/authService";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiShield, FiRefreshCw, FiArrowLeft } from "react-icons/fi";

function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("otpUserId");
  const type = localStorage.getItem("otpType");

  useEffect(() => {
    if (!userId || !type) {
      navigate("/login");
    }
  }, [userId, type, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    setLoading(true);
    try {
      if (type === "register") {
        await verifyRegisterOtp({ userId, otp });
        toast.success("Account verified! Welcome to WasteZero.");
        localStorage.removeItem("otpUserId");
        localStorage.removeItem("otpType");
        setTimeout(() => navigate("/login"), 1500);
      } else if (type === "login") {
        const data = await verifyLoginOtp({ userId, otp });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Authenticated successfully!");
        localStorage.removeItem("otpUserId");
        localStorage.removeItem("otpType");
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendOtp({ userId });
      toast.success("A new verification code has been sent!");
    } catch (err) {
      toast.error("Failed to resend code. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-10 space-y-8 text-center border border-gray-100 dark:border-gray-800 transition-colors"
      >
        <div className="bg-green-50 dark:bg-green-900/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 text-3xl shadow-inner">
          <FiShield />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Verify OTP</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Enter the 6-digit code we sent to your email to continue.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            className="w-full text-center text-4xl font-bold tracking-[0.5em] py-5 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-200 dark:placeholder:text-gray-700 dark:text-white"
            required
            autoComplete="one-time-code"
          />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-green-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Verifying Access..." : "Establish Identity"}
          </button>
        </form>

        <div className="space-y-4 pt-4">
          <button 
            onClick={handleResend}
            disabled={loading}
            className="flex items-center justify-center mx-auto space-x-2 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span>Generate New Token</span>
          </button>
          
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center justify-center mx-auto space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Gateway</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default OtpVerification;

