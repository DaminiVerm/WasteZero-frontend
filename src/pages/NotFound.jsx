import { motion } from "framer-motion";
import { FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-10 text-center space-y-8 animate-fade-in">
      <motion.div
        initial={{ rotate: -10, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        className="w-40 h-40 bg-red-50 dark:bg-red-900/10 rounded-[3rem] flex items-center justify-center text-red-500 shadow-inner"
      >
        <FiAlertTriangle className="text-7xl" />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-7xl font-black text-gray-900 dark:text-white tracking-widest uppercase">404</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-md mx-auto leading-relaxed">
          The requested resource has been moved, archived, or was never properly deployed to our eco-system.
        </p>
      </div>

      <button 
        onClick={() => navigate("/dashboard")}
        className="bg-gray-900 dark:bg-gray-800 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-gray-700 transition-all flex items-center space-x-3 active:scale-95"
      >
        <FiArrowLeft className="text-xl" />
        <span>Return to Hub</span>
      </button>
      
      <div className="pt-10 flex items-center space-x-2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">
         <span>System Integrity Secured</span>
         <span className="text-[6px]">●</span>
         <span>WasteZero Hub</span>
      </div>
    </div>
  );
}
