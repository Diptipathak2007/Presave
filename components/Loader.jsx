"use client";

import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="flex items-center justify-center gap-1.5 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [12, 32, 12],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="w-1.5 bg-spotify-green rounded-full shadow-[0_0_10px_rgba(29,185,84,0.4)]"
        />
      ))}
    </div>
  );
}
