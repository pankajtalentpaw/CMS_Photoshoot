"use client";

import { motion } from "framer-motion";

interface ProgressStepperProps {
  currentStep?: number;
  partialStep?: boolean;
}

const ProgressStepper = ({ currentStep = 1, partialStep = false }: ProgressStepperProps) => {
  const steps = Array.from({ length: 6 }, (_, i) => {
    const stepNum = i + 1;
    return {
      status: currentStep > stepNum ? "full" : currentStep === stepNum ? (partialStep ? "partial" : "full") : "empty"
    };
  });

  return (
    <div className="w-full flex items-center justify-center gap-2 px-5 py-4">
      {steps.map((step, idx) => (
        <div 
          key={idx} 
          className="relative h-[4px] w-[50px] rounded-full bg-white/10 overflow-hidden"
        >
          {step.status === "full" && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="absolute inset-0 bg-gradient-to-r from-[#7C4DFF] to-[#EC4899]" 
            />
          )}
          {step.status === "partial" && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#7C4DFF] to-[#EC4899]" 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
