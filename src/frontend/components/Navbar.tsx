"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 bg-black border-b border-white/10 h-16 shadow-lg"
    >
      <Link href="/" className="text-xl font-bold tracking-tighter text-white">
        FIGMA<span className="text-primary">UI</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {["Features", "Showcase", "Pricing", "About"].map((item) => (
          <Link 
            key={item} 
            href={`#${item.toLowerCase()}`}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="hidden sm:block text-sm font-medium text-[#99A1AF] hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link href="/register">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 77, 255, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 text-sm font-bold text-white bg-figma-gradient rounded-full transition-all"
          >
            Get Started
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
