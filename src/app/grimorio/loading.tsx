import { Suspense } from "react";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="mb-8 border-b border-medieval-iron/30 pb-4 space-y-3">
        <div className="h-12 bg-medieval-stone/50 rounded animate-pulse w-1/3" />
        <div className="h-6 bg-medieval-stone/30 rounded animate-pulse w-2/3" />
      </div>

      {/* Search skeleton */}
      <div className="bg-medieval-stone/80 p-4 rounded-xl mb-6 space-y-4">
        <div className="h-10 bg-black/40 rounded-lg animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-black/40 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#1e1e1e] border border-medieval-iron/40 rounded-xl p-5 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="h-6 bg-medieval-gold/20 rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-medieval-gold/10 rounded w-16 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-parchment-dark/20 rounded w-full animate-pulse" />
              <div className="h-4 bg-parchment-dark/20 rounded w-5/6 animate-pulse" />
            </div>
            <div className="h-20 bg-medieval-stone/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
