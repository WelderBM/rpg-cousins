import GrimorioClient from "./GrimorioClient";
import { Spell } from "@/interfaces/Spells";
import { getAllSpells } from "@/lib/localData";

// Como os dados são estáticos e carregados localmente, não precisamos de ISR
// A página pode ser totalmente estática (SSG - Static Site Generation)

/**
 * Carrega magias diretamente dos arquivos locais
 * Performance máxima: sem latência de rede, sem consultas ao banco
 */
function getSpells(): Spell[] {
  return getAllSpells();
}

export default function GrimorioPage() {
  const spells = getSpells();

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
