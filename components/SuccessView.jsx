"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore, useRef, useMemo } from "react";
import { detectEnvironment } from "@/utils/detectBrowser";
import ErrorState from "./ErrorState";
import ResultCard from "./ResultCard";
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

export default function SuccessView({ searchParams }) {
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
    return "default";
  }, [environment.isSuccess, environment.isError]);

  return (
    <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-spotify-green/10 rounded-full blur-[150px] -z-10" />

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          className="w-full max-w-sm z-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {state === "success" ? (
            <SuccessState />
          ) : state === "error" ? (
            <ErrorState />
          ) : (
            <ResultCard
              tone="neutral"
              icon={<CheckCircle2 className="w-12 h-12 text-white" />}
              title="Success!"
              description="Your presave was successful. Welcome to the release!"
            >
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
              >
                Back to Start
              </Link>
            </ResultCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}