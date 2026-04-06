"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ResultCard from "./ResultCard";

export default function SuccessState({
  description = "The track has been presaved to your Spotify library.",
  actionHref = "/",
  actionLabel = "Back to Start",
}) {
  return (
    <ResultCard
      tone="success"
      icon={<CheckCircle2 className="w-12 h-12 text-spotify-green" />}
      title="Success!"
      description={description}
    >
      <Link
        href={actionHref}
        className="inline-flex w-full items-center justify-center rounded-full bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-white/20 border border-white/5"
      >
        {actionLabel}
      </Link>
    </ResultCard>
  );
}