"use client";

import { Home, LayoutGrid, Sparkles, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const BottomNav = () => {
  const pathname = usePathname();

  const items = [
    { label: "Studio", icon: Home, href: "/" },
    { label: "Gallery", icon: LayoutGrid, href: "/gallery" },
    { label: "AI Lab", icon: Sparkles, href: "/ai-lab" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 h-[85px] bg-black border-t border-white/10 rounded-t-[24px] flex lg:hidden items-center justify-around px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
    >
      {items.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={idx} 
            href={item.href} 
            className="flex flex-col items-center justify-center gap-1.5 w-[70px] h-full transition-all active:scale-95"
          >
            <div className={`transition-all duration-300 ${isActive ? "text-[#D100FF]" : "text-white/40"}`}>
              <item.icon className="w-[24px] h-[24px]" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[11px] font-bold tracking-tight transition-all duration-300 ${isActive ? "text-[#D100FF]" : "text-white/40"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
