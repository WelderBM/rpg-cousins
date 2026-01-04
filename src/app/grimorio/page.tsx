import { dbAdmin } from "@/lib/firebaseAdmin";
import GrimorioClient from "./GrimorioClient";
import { Spell } from "@/interfaces/Spells";

// Force dynamic because we are fetching from DB (though for spells it could be cached heavily)
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

async function getSpells(): Promise<Spell[]> {
  try {
    const snapshot = await dbAdmin.collection("spells").get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as unknown as Spell)
    );
  } catch (error) {
    console.error("Error fetching spells:", error);
    return [];
  }
}

export default async function GrimorioPage() {
  const spells = await getSpells();

  return (
    <div className="container mx-auto max-w-7xl animate-in fade-in duration-500">
      <div className="mb-8 border-b border-medieval-iron/30 pb-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-medieval-gold drop-shadow-lg mb-2">
          Grimório Arcano
        </h1>
        <p className="text-parchment-DEFAULT text-lg">
          Consulte o acervo completo de magias conhecidas em Arton.
        </p>
      </div>

      <GrimorioClient initialSpells={spells} />
    </div>
  );
}
