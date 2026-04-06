"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ResultCard from "./ResultCard";

export default function InstagramWarning() {
  const [mounted, setMounted] = useState(false);
  const hasTriedAutoRedirect = useRef(false);

  const openInExternalBrowser = () => {
    const url = new URL(window.location.href);
    // Remove test params so the "retry" doesn't loop back to warning
    url.searchParams.delete("test");
    const nextUrl = url.toString();
    const cleanUrlString = url.origin + url.pathname + url.search;

    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);

    if (isAndroid) {
      // Intent scheme for Android to force Chrome/System browser
      const intentUrl = `intent://${cleanUrlString.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } else {
      // Standard approach for iOS/others
      const opened = window.open(nextUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.href = nextUrl;
      }
    }
  };

  // 1. Handle hydration mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Auto-trigger on mount
  useEffect(() => {
    if (mounted && !hasTriedAutoRedirect.current) {
      hasTriedAutoRedirect.current = true;
      // Small delay to ensure component is ready
      const timer = setTimeout(() => {
        openInExternalBrowser();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const displayTitle = mounted ? "Opening in Browser..." : "Instagram Browser Detected";
  const iconClass = `w-12 h-12 text-yellow-500 ${mounted ? "animate-pulse" : ""}`;

  return (
    <ResultCard
      tone="warning"
      icon={<AlertTriangle className={iconClass} />}
      title={displayTitle}
      description="Spotify authentication works best in your system browser. We're redirecting you now."
    >
      <div className="space-y-4">
        <button
          onClick={openInExternalBrowser}
          className="w-full bg-spotify-green hover:bg-spotify-green-hover text-black font-black py-4 px-8 rounded-full shadow-lg transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-3 active:scale-95"
        >
          <ExternalLink className="w-5 h-5" />
          Click to Open Manually
        </button>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
          If you're not redirected, tap the three dots (...) and select "Open in Browser"
        </p>
      </div>
    </ResultCard>
  );
}
