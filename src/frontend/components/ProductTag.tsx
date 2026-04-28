"use client";

import { motion } from "framer-motion";

interface ProductTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

const ProductTag = ({ label, selected = false, onClick }: ProductTagProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full border transition-all cursor-pointer ${
        selected 
          ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899] border-transparent text-white shadow-lg" 
          : "bg-[#2E1C4D] border-[#46277C] text-[#C5B6DE] hover:border-[#7C4DFF]"
      }`}
    >
      <span className="font-roboto font-medium text-[15px] leading-[18px]">
        {label}
      </span>
    </motion.button>
  );
};

export default ProductTag;
