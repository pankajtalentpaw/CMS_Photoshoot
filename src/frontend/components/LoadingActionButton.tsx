"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface LoadingActionButtonProps {
  isLoading: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}

const LoadingActionButton = ({
  isLoading,
  onClick,
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  icon
}: LoadingActionButtonProps) => {
  const baseStyles = "relative flex items-center justify-center gap-2 rounded-full font-roboto font-semibold transition-all overflow-hidden";
  
  const variants = {
    primary: "bg-figma-gradient text-white shadow-[0_4px_30px_rgba(124,77,255,0.4)] hover:brightness-110",
    secondary: "bg-[#1A1F2E] border border-white/5 text-[#C5B6DE] hover:bg-[#252B3D]"
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { 
        scale: 1.02,
        boxShadow: "0 0 40px rgba(124, 77, 255, 0.6)"
      } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled || isLoading ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}`}
    >
      <motion.div 
        animate={isLoading ? { opacity: 0.8 } : { opacity: 1 }}
        className="relative z-10 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="flex items-center gap-3" role="status" aria-live="polite">
            <Loader2 className="w-5 h-5 animate-spin text-white" aria-hidden="true" />
            <span className="opacity-80">Processing...</span>
          </div>
        ) : (
          <>
            {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
            {children}
          </>
        )}
      </motion.div>

      {/* Shine effect animation */}
      <motion.div 
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
        aria-hidden="true"
      />
    </motion.button>
  );
};

export default LoadingActionButton;
