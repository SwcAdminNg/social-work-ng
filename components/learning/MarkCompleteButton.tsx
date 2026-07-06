"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner, IconCheck } from "@/components/auth/shared/icons";

interface MarkCompleteButtonProps {
  courseId: string;
  itemId: string;
  isCompleted: boolean;
  className?: string;
}

export function MarkCompleteButton({ courseId, itemId, isCompleted, className = "" }: MarkCompleteButtonProps) {
  const [marking, setMarking] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    if (isCompleted) return;
    
    setMarking(true);
    try {
      await fetch(`/api/proxy/learning/courses/${courseId}/items/${itemId}/complete`, { 
        method: "POST" 
      });
      router.refresh();
    } catch (e) {
      console.error("Failed to mark as complete", e);
    } finally {
      setMarking(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isCompleted || marking}
      className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg text-sm transition-all ${
        isCompleted 
          ? "bg-green-100 dark:bg-[#2D6A4F]/20 text-green-700 dark:text-[#52b788] cursor-default" 
          : "bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm hover:-translate-y-0.5"
      } ${className}`}
    >
      {marking ? (
        <IconSpinner className="w-4 h-4 animate-spin" />
      ) : isCompleted ? (
        <span className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full"><IconCheck /></span>
      ) : null}
      
      {isCompleted ? "Completed" : marking ? "Marking..." : "Mark as Complete"}
    </button>
  );
}
