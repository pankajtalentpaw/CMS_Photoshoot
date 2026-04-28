"use client";

import Image from "next/image";

interface SegmentCardProps {
  title: string;
  image: string;
  fullWidth?: boolean;
}

const SegmentCard = ({ title, image, fullWidth = false }: SegmentCardProps) => {
  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
      <div className={`relative ${fullWidth ? "w-full" : "w-full aspect-[171/135]"} h-[135px] rounded-[10px] overflow-hidden border border-white/5`}>
        {/* Background Image */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          loading="lazy" 
        />
        
        {/* Subtle gradient to match reference depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      {/* Label BELOW the card */}
      <div className="flex items-center justify-center">
        <span className={`font-roboto ${fullWidth ? "font-semibold" : "font-medium"} text-base leading-[19px] text-[#FFFFFF] group-hover:text-figma-gradient transition-colors`}>
          {title}
        </span>
      </div>
    </div>
  );
};

export default SegmentCard;
