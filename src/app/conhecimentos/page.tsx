import { getAllSpells } from "@/lib/localData";
import ConhecimentosClient from "./ConhecimentosClient";
import { Suspense } from "react";

export default async function ConhecimentosPage() {
  const spells = await getAllSpells();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <ConhecimentosClient initialSpells={spells} />
    </Suspense>
  );
}
