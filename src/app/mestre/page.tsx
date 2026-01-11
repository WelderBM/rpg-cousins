import { Suspense } from "react";
import MestreClient from "./MestreClient";

export const metadata = {
  title: "Mestre | RPG Cousins",
  description: "Área do mestre para gerenciamento de monstros e campanhas.",
};

function MestreLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
    </div>
  );
}

export default function MestrePage() {
  return (
    <Suspense fallback={<MestreLoading />}>
      <MestreClient />
    </Suspense>
  );
}
