import { Suspense } from "react";
import HeroesClient from "./HeroesClient";

export default function HeroesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-medieval-stone/30 items-center justify-center">
          <div className="w-16 h-16 border-4 border-medieval-gold/30 border-t-medieval-gold rounded-full animate-spin"></div>
        </div>
      }
    >
      <HeroesClient />
    </Suspense>
  );
}
