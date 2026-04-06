"use client";

import { motion } from "framer-motion";

const toneStyles = {
  success: {
    icon: "bg-spotify-green/10 text-spotify-green",
    accent: "border-spotify-green/20",
  },
  warning: {
    icon: "bg-yellow-500/10 text-yellow-500",
    accent: "border-yellow-500/20",
  },
  error: {
    icon: "bg-red-500/10 text-red-400",
    accent: "border-red-500/20",
  },
  neutral: {
    icon: "bg-white/10 text-white",
    accent: "border-white/10",
  },
};

export default function ResultCard({
  icon,
  title,
  description,
  tone = "neutral",
  children,
}) {
  const styles = toneStyles[tone] || toneStyles.neutral;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5 
      }}
      className={`glass-card p-10 rounded-[2.5rem] text-center max-w-sm w-full shadow-premium relative z-10 ${styles.accent}`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 ${styles.icon}`}
      >
        {icon}
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-white mb-3 tracking-tight"
      >
        {title}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-10 font-bold text-sm leading-relaxed"
      >
        {description}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}