"use client";

export default function DebugPanel({ environment }) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-white/10 bg-black/80 p-4 text-left text-xs text-gray-300 shadow-2xl backdrop-blur md:left-auto md:right-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-400">
        Debug
      </p>
      <dl className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-gray-500">isInstagram</dt>
          <dd className="text-right text-white">{String(environment?.isInstagram ?? false)}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-gray-500">isTestMode</dt>
          <dd className="text-right text-white">{String(environment?.isTestMode ?? false)}</dd>
        </div>
        <div>
          <dt className="mb-1 text-gray-500">queryParams</dt>
          <dd className="rounded-xl bg-white/5 p-2 text-[11px] text-gray-200 overflow-x-auto whitespace-pre-wrap">
            <pre className="m-0">{JSON.stringify(environment?.queryParams ?? {}, null, 2)}</pre>
          </dd>
        </div>
      </dl>
    </div>
  );
}