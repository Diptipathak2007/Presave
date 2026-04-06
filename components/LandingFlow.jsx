"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { detectEnvironment } from "@/utils/detectBrowser";
import DebugPanel from "./DebugPanel";
import ErrorState from "./ErrorState";
import InstagramWarning from "./InstagramWarning";
import PresaveCard from "./PresaveCard";
import SuccessState from "./SuccessState";

function getSearchParamValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getInitialEnvironment(searchParams = {}) {
  return {
    isInstagram: getSearchParamValue(searchParams.test) === "instagram",
    isTestMode: getSearchParamValue(searchParams.test) !== undefined,
    isSuccess: getSearchParamValue(searchParams.success) === "true",
    isError: getSearchParamValue(searchParams.error) === "true",
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

// Stable cached snapshot — prevents useSyncExternalStore infinite loop
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

export default function LandingFlow({ searchParams }) {
  // Use a standard mounted state for hydration safety
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const serverSnapshotRef = useRef(null);
  
  // Use useMemo for stable initialization
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
    if (environment.isInstagram) return "instagram";
    return "presave";
  }, [environment.isSuccess, environment.isError, environment.isInstagram]);

  return (
    <main className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-spotify-dark p-6">
      {/* Dynamic Background Blobs */}
      {isMounted && (
        <>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-spotify-green rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </>
      )}

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
              <ErrorState />
            ) : state === "instagram" ? (
              <InstagramWarning />
            ) : (
              <PresaveCard isTestMode={environment.isTestMode} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <DebugPanel environment={environment} />
    </main>
  );
}