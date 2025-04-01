"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  color?: string;
  readOnly?: boolean;
}

export function Rating({
  value,
  onChange,
  size = "md",
  color = "#FFD700",
  readOnly = false
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };
  
  const displayValue = hoverValue !== null ? hoverValue : value;
  
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readOnly}
          whileHover={{ scale: readOnly ? 1 : 1.1 }}
          whileTap={{ scale: readOnly ? 1 : 0.9 }}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHoverValue(star)}
          onMouseLeave={() => !readOnly && setHoverValue(null)}
          className={`${sizes[size]} focus:outline-none transition-colors ${
            readOnly ? "cursor-default" : "cursor-pointer"
          }`}
          style={{
            color: star <= displayValue ? color : "#D1D5DB",
            textShadow: star <= displayValue ? "0 0 10px rgba(255, 215, 0, 0.5)" : "none"
          }}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          ★
        </motion.button>
      ))}
      
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-600">{displayValue || 0} / 5</span>
      )}
    </div>
  );
} 