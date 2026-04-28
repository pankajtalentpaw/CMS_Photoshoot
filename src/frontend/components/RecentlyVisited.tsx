"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RecentBranch {
  title: string;
  path: string;
  timestamp: number;
}

const RecentlyVisited = () => {
  const [recent, setRecent] = useState<RecentBranch | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("last_visited_branch");
    if (stored) {
      try {
        setRecent(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent branch");
      }
    }
  }, []);

  if (!recent) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 mb-10 w-full max-w-7xl mx-auto"
    >
      <div className="bg-white/5 border border-white/10 rounded-[20px] p-5 flex items-center justify-between group hover:bg-white/[0.08] transition-all cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#7C4DFF]/20 flex items-center justify-center">
            <History className="w-6 h-6 text-[#7C4DFF]" />
          </div>
          <div>
            <h3 className="font-roboto font-semibold text-white text-base">Jump Back In</h3>
            <p className="font-roboto font-normal text-[#99A1AF] text-sm">Continue your last project in <span className="text-[#C5B6DE]">{recent.title}</span></p>
          </div>
        </div>
        
        <Link href={recent.path}>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#7C4DFF] transition-all group-hover:shadow-[0_0_15px_rgba(124,77,255,0.4)]">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </Link>
      </div>
    </motion.section>
  );
};

export default RecentlyVisited;
