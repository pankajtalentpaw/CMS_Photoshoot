"use client";

import Image from "next/image";
import { Check, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ModelItem {
  id: string;
  image: string;
}

interface ModelScrollProps {
  selectedId: string | null;
  onSelect: (model: ModelItem) => void;
  onPreview?: (model: ModelItem) => void;
  modelsOverride?: ModelItem[];
}

const ModelScroll = ({ selectedId, onSelect, onPreview, modelsOverride }: ModelScrollProps) => {
  const defaultModels = [
    { id: "1", image: "/Model_1.jpg" },
    { id: "2", image: "/Model_2.jpg" },
    { id: "3", image: "/Model_3.jpg" },
    { id: "4", image: "/Model_4.jpg" },
    { id: "5", image: "/Model_5.jpg" },
    { id: "6", image: "/Model_6.jpg" },
    { id: "7", image: "/Model_7.jpg" },
    { id: "8", image: "/Model_8.jpg" },
  ];
  
  const models = modelsOverride && modelsOverride.length > 0 ? modelsOverride : defaultModels;

  return (
    <div
      role="radiogroup"
      aria-label="Select a model"
      className="w-full flex items-center justify-start gap-[10px] h-scroll no-scrollbar scroll-smooth"
    >
      {models.map((model) => {
        const isSelected = selectedId === model.id;
        return (
          <motion.button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Model ${model.id}${isSelected ? " (selected)" : ""}`}
            onClick={() => onSelect(model)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(model);
              }
            }}
            onDoubleClick={() => onPreview?.(model)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-[131px] h-[169px] rounded-md overflow-hidden flex-none group cursor-pointer border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C4DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              isSelected ? "border-[#7C4DFF]" : "border-white/5 shadow-inner"
            }`}
          >
            <Image
              src={model.image}
              alt={`Model option ${model.id}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 180px, 131px"
              loading="lazy"
            />
            
            {/* Preview trigger */}
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onPreview?.(model);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onPreview?.(model);
                }
              }}
              className="absolute top-1.5 right-1.5 w-[15px] h-[15px] rounded-sm bg-gradient-to-br from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7] flex items-center justify-center"
              aria-label={`Preview model ${model.id}`}
            >
              <Eye className="w-[9px] h-[9px] text-white" />
            </span>

            {/* Selection Indicator */}
            <div
              aria-hidden="true"
              className={`absolute bottom-1.5 right-1.5 w-[15px] h-[15px] rounded-sm bg-gradient-to-br from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7] flex items-center justify-center transition-opacity ${
                isSelected ? "opacity-100" : "opacity-0"
              }`}
            >
              <Check className="w-[10px] h-[10px] text-white" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ModelScroll;
