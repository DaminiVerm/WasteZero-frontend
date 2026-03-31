import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 bg-white dark:bg-gray-900 shadow-xl shadow-gray-100 dark:shadow-none z-40 transition-colors duration-300">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1600px] mx-auto min-h-full px-4 py-6 sm:px-6 sm:py-8 lg:p-10 pb-28 lg:pb-10"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <div className="lg:hidden">
        <Sidebar />
      </div>
    </div>
  );
}
