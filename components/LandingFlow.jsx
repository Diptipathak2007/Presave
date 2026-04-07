"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { useSyncExternalStore } from "react";
import { detectEnvironment } from "@/utils/detectBrowser";
import ErrorState from "./ErrorState";
import PresaveCard from "./PresaveCard";
import SuccessState from "./SuccessState";

function buildAndroidIntentUrl(targetUrl) {
  const normalized = targetUrl.replace(/^https?:\/\//, "");
  const fallback = encodeURIComponent(targetUrl);
  return `intent://${normalized}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

function attemptExternalBrowserEscape() {
  const targetUrl = window.location.href;
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);

  if (isAndroid) {
    window.location.replace(buildAndroidIntentUrl(targetUrl));
    return;
  }

  const noProtocol = targetUrl.replace(/^https?:\/\//, "");
  window.location.replace(`x-safari-https://${noProtocol}`);
  setTimeout(() => {
    const opened = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.replace(targetUrl);
    }
  }, 400);
}

function getSearchParamValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getInitialEnvironment(searchParams = {}) {
  const errorValue = getSearchParamValue(searchParams.error);

  return {
    isInstagram: getSearchParamValue(searchParams.test) === "instagram",
    isInAppBrowser: false,
    isTestMode: getSearchParamValue(searchParams.test) !== undefined,
    isSuccess: getSearchParamValue(searchParams.success) === "true",
    isError: errorValue !== undefined,
    queryParams: Object.fromEntries(
      Object.entries(searchParams).map(([key, value]) => [
        key,
        getSearchParamValue(value),
      ]),
    ),
  };
}

function subscribeToLocationChanges(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

let cachedEnvironment = null;
function getClientSnapshot() {
  const next = detectEnvironment();
  if (
    cachedEnvironment &&
    cachedEnvironment.isInstagram === next.isInstagram &&
    cachedEnvironment.isTestMode === next.isTestMode &&
    cachedEnvironment.isSuccess === next.isSuccess &&
    cachedEnvironment.isError === next.isError
  ) {
    return cachedEnvironment;
  }
  cachedEnvironment = next;
  return cachedEnvironment;
}

function getErrorContent(errorCode) {
  switch (errorCode) {
    case "config":
      return {
        title: "Configuration Error",
        description: "Server settings are missing. Please contact support.",
      };
    case "invalid_state":
      return {
        title: "Authentication Expired",
        description: "Please retry presave from the start.",
      };
    case "token_fail":
      return {
        title: "Spotify Login Failed",
        description: "We could not complete Spotify authentication. Please try again.",
      };
    case "save_fail":
      return {
        title: "Could Not Save Track",
        description: "Spotify accepted login, but saving the track failed. Please retry.",
      };
    case "save_scope":
      return {
        title: "Permission Needed",
        description: "Spotify did not grant library write permission. Please retry and accept all permissions.",
      };
    case "save_premium":
      return {
        title: "Spotify Premium Required",
        description: "Spotify requires an active Premium subscription on the app owner account for this save action.",
      };
    case "save_track":
      return {
        title: "Track Configuration Error",
        description: "The configured Spotify track ID is invalid. Update SPOTIFY_TRACK_ID and retry.",
      };
    case "timeout":
      return {
        title: "Request Timed Out",
        description: "Spotify did not respond in time. Please retry from your external browser.",
      };
    default:
      return {
        title: "Something went wrong",
        description: "Please try again.",
      };
  }
}

export default function LandingFlow({ searchParams }) {
  const serverSnapshotRef = useRef(null);
  
  const initialEnv = useMemo(() => getInitialEnvironment(searchParams), [searchParams]);
  if (serverSnapshotRef.current === null) {
    serverSnapshotRef.current = initialEnv;
  }

  const environment = useSyncExternalStore(
    subscribeToLocationChanges,
    getClientSnapshot,
    () => serverSnapshotRef.current,
  );

  const state = useMemo(() => {
    if (environment.isSuccess) return "success";
    if (environment.isError) return "error";
    return "presave";
  }, [environment.isSuccess, environment.isError]);

  const errorCode = environment.queryParams?.error;
  const errorContent = useMemo(() => getErrorContent(errorCode), [errorCode]);
  const shouldEscapeToExternalBrowser =
    environment.isInAppBrowser && !environment.isSuccess && !environment.isError;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (environment.isSuccess || environment.isError) return;
    if (!environment.isInAppBrowser) return;

    const first = setTimeout(() => {
      attemptExternalBrowserEscape();
    }, 100);
    const second = setTimeout(() => {
      attemptExternalBrowserEscape();
    }, 1200);

    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [environment.isInAppBrowser, environment.isSuccess, environment.isError]);

  if (shouldEscapeToExternalBrowser) {
    return (
      <main className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-spotify-dark p-6">
        <p className="text-white text-sm font-bold uppercase tracking-wider">Opening in browser for better experience...</p>
      </main>
    );
  }

  return (
    <main className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-spotify-dark p-6">
      <>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-spotify-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </>

      <div className="z-10 mx-auto w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {state === "success" ? (
              <SuccessState />
            ) : state === "error" ? (
              <ErrorState
                title={errorContent.title}
                description={errorContent.description}
              />
            ) : (
              <PresaveCard isTestMode={environment.isTestMode} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}