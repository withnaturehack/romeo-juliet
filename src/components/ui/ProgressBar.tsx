"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500 font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#4A5E41] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-[#4A5E41]"
                    : isActive
                    ? "border-2 border-[#4A5E41] bg-transparent"
                    : "bg-gray-200"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
