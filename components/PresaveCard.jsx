"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Loader from "./Loader";

export default function PresaveCard({ isTestMode = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [helperText, setHelperText] = useState("Connecting to Spotify...");

  const getAuthUrl = () => {
    const returnTo = "/presave";
    return `/api/auth?return_to=${encodeURIComponent(returnTo)}`;
  };

  const handlePresave = () => {
    setIsLoading(true);
    setHelperText("Connecting to Spotify...");

    if (isTestMode) {
      window.location.href = "/success?success=true";
      return;
    }

    const authUrl = getAuthUrl();
    const ua = navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    if (!isMobile) {
      setHelperText("Redirecting to Spotify login...");
      window.location.href = authUrl;
      return;
    }

    // Best-effort app-first attempt. OAuth consent is still handled by Spotify web OAuth.
    window.location.href = "spotify://";
    setTimeout(() => {
      setHelperText("Redirecting to Spotify login...");
      window.location.href = authUrl;
    }, 1100);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-card w-full max-w-sm mx-auto rounded-[2.5rem] overflow-hidden shadow-premium p-1"
    >
      <div className="bg-spotify-dark/40 rounded-[2.2rem] overflow-hidden pb-8 backdrop-blur-md">
        {/* Cover Art Area */}
        <motion.div 
          variants={itemVariants}
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative aspect-square w-full bg-linear-to-br from-white/5 to-white/0 group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-spotify-green/20 via-transparent to-purple-500/10 opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
               <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-black flex items-center justify-center">
                 <div className="w-16 h-16 bg-spotify-green/20 rounded-full blur-2xl animate-pulse" />
                 <span className="text-7xl drop-shadow-2xl z-10 filter grayscale group-hover:grayscale-0 transition-all duration-500">🎧</span>
               </div>
               <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
        
        <div className="px-8 pt-6 pb-2 text-center flex flex-col items-center">
          <motion.h1 
            variants={itemVariants}
            className="text-2xl font-black text-white mb-1 tracking-tight"
          >
            New Single Title
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-gray-400 font-bold mb-8 text-xs uppercase tracking-widest"
          >
            Upcoming Artist
          </motion.p>
          
          <motion.div variants={itemVariants} className="w-full">
            {isLoading ? (
              <div className="space-y-2 py-2">
                <div className="h-14 flex items-center justify-center"><Loader /></div>
                <p className="text-[11px] text-gray-300 font-semibold tracking-wide">🎧 {helperText}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">If you are not logged in, Spotify may ask you to sign in.</p>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(29, 185, 84, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePresave}
                className="w-full bg-spotify-green hover:bg-spotify-green-hover text-black font-black py-4 px-8 rounded-full shadow-lg transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-3"
              >
                Presave Now
              </motion.button>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-2 mt-8">
            <div className="w-1 h-1 rounded-full bg-spotify-green animate-pulse" />
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Releasing in 4 days</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
