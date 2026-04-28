"use client";

import Image from "next/image";
import Link from "next/link";
import { Coins } from "lucide-react";
import { motion } from "framer-motion";

const TopNav = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[99px] rounded-b-[30px] bg-black flex flex-col justify-between pt-[10px] pb-[14px]">
      {/* iOS Status Bar Mockup (Frame 1) */}
      <div className="flex justify-between items-center px-5 h-[10px]">
        <div className="w-[34px] h-[10px] bg-white rounded-sm" />
        <div className="w-[60px] h-[10px] bg-white rounded-sm" />
      </div>

      {/* Main Nav Content (Container) */}
      <div className="flex items-center justify-between px-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* Logo/Icon (Background+Shadow) */}
          <div className="w-[32px] h-[32px] bg-[#7C4DFF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,77,255,0.5)] cursor-pointer">
            <div className="w-3 h-3 bg-white rotate-45" />
          </div>
          
          <h1 className="font-manrope font-bold text-lg leading-7 tracking-[-0.45px] text-[#E2E2E8]">
            Heading 1
          </h1>
        </div>

        {/* Desktop Links removed to avoid redundancy with BottomNav */}

        <div className="flex items-center gap-2">
          {/* Credits Badge (Group 2) */}
          <div className="flex items-center px-[11px] py-[12px] h-[38px] rounded-l-full bg-[rgba(48,48,48,0.2)] border border-[#2F2751] gap-2">
            <Coins className="w-[10.5px] h-[10.5px] text-[#7C4DFF]" />
            <span className="font-roboto font-medium text-[11px] tracking-[0.55px] uppercase text-[#7C4DFF]">
              120 Credits
            </span>
          </div>

          {/* Profile Avatar (Ellipse 1) */}
          <Link href="/profile">
            <div className="w-[45px] h-[45px] rounded-full border border-[#2F2751] overflow-hidden cursor-pointer hover:border-[#7C4DFF]/50 transition-all">
              <Image
                src="/profile_avatar_placeholder.png"
                alt="Profile"
                width={45}
                height={45}
                className="object-cover"
                loading="lazy" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
