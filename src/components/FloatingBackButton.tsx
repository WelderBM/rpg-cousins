"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface FloatingBackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  onClick,
  className = "",
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <motion.button
      onClick={handleBack}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.1, x: -5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`fixed top-6 left-6 z-50 p-3 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full 
      hover:bg-amber-600 hover:border-amber-500 hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)] 
      transition-all duration-300 group ${className}`}
      title="Voltar"
    >
      <ArrowLeft
        size={24}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
    </motion.button>
  );
};
