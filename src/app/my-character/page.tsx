import { Suspense } from "react";
import MyCharacterClient from "./MyCharacterClient";

export default function MyCharacterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-amber-500 font-serif">
          <div className="w-16 h-16 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-4 tracking-widest animate-pulse">
            CARREGANDO GRIMÓRIO...
          </p>
        </div>
      }
    >
      <MyCharacterClient />
    </Suspense>
  );
}
