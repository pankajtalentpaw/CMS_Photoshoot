"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  image: string;
  description?: string;
}

const CategoryCard = ({ title, icon: Icon, image, description }: CategoryCardProps) => {
  return (
    <div
      role="article"
      aria-label={`${title} — ${description ?? "Creative hub"}`}
      className="relative w-full aspect-[169/141] rounded-[10px] overflow-hidden shadow-[0px_7.06px_28.24px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] group"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt=""
        role="presentation"
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/90 focus:from-black/10 transition-colors" aria-hidden="true" />
      
      {/* Content (Auto Layout) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center py-[40.595px] gap-[7.06px] text-center">
        {/* Glow Icon — decorative */}
        <div className="glow-pink" aria-hidden="true">
          <Icon className="w-[28px] h-[28.97px] text-white" />
        </div>
        
        {/* Label */}
        <span className="font-roboto font-semibold text-[16px] leading-[19px] text-white uppercase tracking-wider">
          {title}
        </span>

        {/* Descriptor — boosted contrast from opacity-70 to opacity-90 for WCAG AA */}
        {description && (
          <p className="font-roboto font-normal text-[11px] leading-tight text-[#D6D9E4] max-w-[140px] opacity-90 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
