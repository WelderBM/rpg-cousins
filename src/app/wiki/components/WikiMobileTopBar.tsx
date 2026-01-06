import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function WikiMobileTopBar() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-neutral-900/80 backdrop-blur-md border-b border-amber-900/20 sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <ArrowLeft className="w-4 h-4 text-amber-500" />
        </div>
        <span className="font-cinzel text-base text-amber-100 font-bold">
          Compêndio
        </span>
      </Link>
      <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
        Tormenta20
      </div>
    </div>
  );
}
