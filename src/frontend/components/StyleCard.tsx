"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

interface StyleCardProps {
  title: string;
  subtitle: string;
  image?: string;
  icon?: LucideIcon;
}

const StyleCard = ({ title, subtitle, image, icon: Icon }: StyleCardProps) => {
  return (
    <div className="relative w-full h-[111px] bg-[#1A1E29] rounded-[10px] overflow-hidden group cursor-pointer flex items-center px-[13px] border border-white/5 hover:border-white/20 transition-all">
      {/* Decorative Image/Icon Container (Rectangle 12) */}
      <div className="relative w-[95px] h-[85px] rounded-[10px] overflow-hidden flex-none">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
           loading="lazy" />
        ) : Icon ? (
          <div className="w-full h-full bg-[#0B0B0B] flex items-center justify-center">
            <div className="w-9 h-9 bg-[#00C2FF] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(35,161,255,0.5)]">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-[#0B0B0B]" />
        )}
      </div>

      {/* Text Content (Group 26) */}
      <div className="ml-5 flex flex-col justify-center">
        <h3 className="font-roboto font-medium text-xl leading-[23px] text-white mb-1.5">
          {title}
        </h3>
        <p className="font-roboto font-normal text-[13px] leading-[15px] text-[#C2C6D6]">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default StyleCard;
