"use client";

import { Home, Image as ImageIcon, Sparkles, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BottomNav = () => {
  const pathname = usePathname();

  const items = [
    { label: "Studio", icon: Home, href: "/" },
    { label: "Gallery", icon: ImageIcon, href: "/gallery" },
    { label: "AI Lab", icon: Sparkles, href: "/ai-lab" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 h-[99px] bg-black rounded-t-[30px] shadow-[0px_-6px_38px_rgba(35,161,255,0.25)] flex lg:hidden items-center justify-around px-5 pb-[15px]"
    >
      {items.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={idx} 
            href={item.href} 
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-2 group w-[68.75px]"
          >
            <div className={`w-6 h-6 flex items-center justify-center ${isActive ? "glow-blue" : "text-[#9CA3AF]"}`}>
              <item.icon className={`w-6 h-6 ${isActive ? "text-white" : "text-[#9CA3AF]"}`} aria-hidden="true" />
            </div>
            <span className={`font-inter font-medium text-xs leading-[16px] text-center ${isActive ? "text-figma-gradient" : "text-[#9CA3AF]"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
