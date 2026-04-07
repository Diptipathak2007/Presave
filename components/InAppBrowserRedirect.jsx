"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import ResultCard from "./ResultCard";

function getEscapedUrl() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete("force_inapp");
  return currentUrl.toString();
}

function toAndroidIntentUrl(httpsUrl) {
  const normalized = httpsUrl.replace(/^https?:\/\//, "");
  const fallback = encodeURIComponent(httpsUrl);
  return `intent://${normalized}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

export default function InAppBrowserRedirect() {
  const attemptedRef = useRef(false);

  const isAndroid = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android/i.test(navigator.userAgent || "");
  }, []);

  const openExternalBrowser = useCallback(() => {
    const targetUrl = getEscapedUrl();

    if (isAndroid) {
      window.location.href = toAndroidIntentUrl(targetUrl);
      return;
    }

    const withoutProtocol = targetUrl.replace(/^https?:\/\//, "");
    window.location.href = `x-safari-https://${withoutProtocol}`;

    setTimeout(() => {
      const opened = window.open(targetUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.href = targetUrl;
      }
    }, 350);
  }, [isAndroid]);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const firstAttempt = setTimeout(() => {
      openExternalBrowser();
    }, 300);

    const secondAttempt = setTimeout(() => {
      openExternalBrowser();
    }, 1200);

    return () => {
      clearTimeout(firstAttempt);
      clearTimeout(secondAttempt);
    };
  }, [openExternalBrowser]);

  return (
    <ResultCard
      tone="warning"
      title="Opening In Browser"
      description="Instagram blocks parts of Spotify auth. We are opening this page in your phone browser now."
    />
  );
}