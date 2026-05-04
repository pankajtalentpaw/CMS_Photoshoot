"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { ChevronLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProject } from "@/frontend/context/ProjectContext";
import { useAuth } from "@/frontend/context/AuthContext";

interface FlowHeaderProps {
  title: string;
  showBack?: boolean;
}

const FlowHeader = ({ title, showBack = true }: FlowHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { credits } = useProject();
  const { isAuthenticated, userProfile } = useAuth();

  const userInitials = [
    (userProfile?.firstName?.[0] ?? "").toUpperCase(),
    (userProfile?.lastName?.[0] ?? "").toUpperCase(),
  ].filter(Boolean).join("") || "AG";

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs = [];
    
    if (parts.length > 0) {
      if (parts.includes('apparel')) crumbs.push('Apparel');
      if (parts.includes('jewellery')) crumbs.push('Jewellery');
      if (parts.includes('accessories')) crumbs.push('Accessories');
      if (parts.includes('products')) crumbs.push('Products');
      
      const segment = params.segment as string;
      const style = params.style as string;
      
      if (segment) crumbs.push(segment.charAt(0).toUpperCase() + segment.slice(1));
      if (style) crumbs.push(style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
    
    return crumbs.join(' > ');
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header 
      className="fixed top-0 left-0 right-0 h-[100px] border-b border-white/10 z-[100] px-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-black"
    >
      <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                aria-label="Go back to previous step"
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all group cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
              </motion.button>
            )}
            
            <div className="flex flex-col">
              {breadcrumbs && (
                <span className="hidden md:block font-roboto text-[10px] uppercase tracking-widest text-[#7C4DFF] mb-1 font-bold">
                  {breadcrumbs}
                </span>
              )}
              <h1 className="font-roboto font-bold text-[20px] md:text-2xl text-white">
                {title}
              </h1>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 ml-10">
            {[
              { label: "Studio", href: "/" },
              { label: "Gallery", href: "/gallery" },
              { label: "AI Lab", href: "/ai-lab" },
              { label: "Profile", href: "/profile" },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`font-inter font-medium text-sm transition-all relative py-2 ${
                    isActive 
                      ? "text-white" 
                      : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C4DFF] to-[#EC4899] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 md:gap-6">
            {isAuthenticated ? (
              <>
                <div
                  role="status"
                  aria-label={`${credits} credits remaining`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-lg"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#7C4DFF]" aria-hidden="true" />
                  <span className="font-roboto font-bold text-xs text-white tracking-wide flex items-center gap-1.5" aria-hidden="true">
                    <span className="text-white">{credits}</span>
                    <span className="text-[#7C4DFF] uppercase opacity-90 text-[10px]">CREDITS</span>
                  </span>
                </div>

                <Link href="/profile" aria-label="View your profile">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-lg overflow-hidden"
                    aria-hidden="true"
                  >
                    {userProfile?.profileImage ? (
                      <img 
                        src={userProfile.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-xs md:text-base text-white" aria-hidden="true">
                        {userInitials}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Link href="/login">
                  <button className="text-[#9CA3AF] hover:text-white transition-colors text-xs md:text-sm font-medium px-2 py-1 cursor-pointer">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(124,77,255,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#7C4DFF] to-[#EC4899] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-[0_0_20px_rgba(124,77,255,0.3)] transition-all whitespace-nowrap cursor-pointer"
                  >
                    Register
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default FlowHeader;
