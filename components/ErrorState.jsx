"use client";

import { AlertTriangle, FlaskConical } from "lucide-react";
import Link from "next/link";
import ResultCard from "./ResultCard";

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  actionHref = "/",
  actionLabel = "Try Again",
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <ResultCard
      tone="error"
      icon={<AlertTriangle className="w-12 h-12 text-red-400" />}
      title={title}
      description={description}
    >
      <div className="flex flex-col gap-3 w-full">
        <Link
          href={actionHref}
          className="inline-flex w-full items-center justify-center rounded-full bg-red-500/20 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-500/30 border border-red-500/20 active:scale-95"
        >
          {actionLabel}
        </Link>

        {isDev && (
          <Link
            href="/?test=true"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 border border-dotted border-white/10 active:scale-95"
          >
            <FlaskConical className="w-4 h-4" />
            Try in Test Mode (Skip API)
          </Link>
        )}
      </div>
    </ResultCard>
  );
}