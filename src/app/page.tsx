import Link from "next/link";
import { Wand2, BookOpen, Scroll } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-700">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-medieval-gold drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Bem-vindo ao
          <br />
          Portal RPG Cousins
        </h2>
        <p className="text-lg text-parchment-DEFAULT max-w-2xl mx-auto leading-relaxed border-t border-b border-medieval-iron/30 py-4">
          Seu hub definitivo para aventuras em Arton. Crie personagens
          lendários, consulte o grimório arcano e gerencie sua campanha no
          sistema Tormenta 20.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl px-4">
        {/* Card: Wizard */}
        <Link
          href="/wizard"
          className="p-6 rounded-xl border border-medieval-iron/50 bg-black/20 hover:bg-medieval-gold/5 hover:border-medieval-gold/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-95 duration-300"
        >
          <div className="mb-4 p-3 bg-medieval-gold/10 rounded-full group-hover:bg-medieval-gold/20 transition-colors">
            <Wand2 className="w-8 h-8 text-medieval-gold" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <h3 className="text-2xl font-serif text-parchment-light group-hover:text-medieval-gold transition-colors mb-2 relative z-10">
            Novo Personagem
          </h3>
          <p className="text-sm text-parchment-dark relative z-10">
            Inicie o wizard de criação passo a passo com cálculo automático.
          </p>
        </Link>

        {/* Card: Grimório */}
        <Link
          href="/grimorio"
          className="p-6 rounded-xl border border-medieval-iron/50 bg-black/20 hover:bg-medieval-gold/5 hover:border-medieval-gold/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-95 duration-300"
        >
          <div className="mb-4 p-3 bg-medieval-gold/10 rounded-full group-hover:bg-medieval-gold/20 transition-colors">
            <BookOpen className="w-8 h-8 text-medieval-gold" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <h3 className="text-2xl font-serif text-parchment-light group-hover:text-medieval-gold transition-colors mb-2 relative z-10">
            Grimório
          </h3>
          <p className="text-sm text-parchment-dark relative z-10">
            Busca rápida de magias e calculadora de Mana.
          </p>
        </Link>

        {/* Card: Wiki */}
        <Link
          href="/wiki"
          className="p-6 rounded-xl border border-medieval-iron/50 bg-black/20 hover:bg-medieval-gold/5 hover:border-medieval-gold/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-95 duration-300"
        >
          <div className="mb-4 p-3 bg-medieval-gold/10 rounded-full group-hover:bg-medieval-gold/20 transition-colors">
            <Scroll className="w-8 h-8 text-medieval-gold" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <h3 className="text-2xl font-serif text-parchment-light group-hover:text-medieval-gold transition-colors mb-2 relative z-10">
            Wiki T20
          </h3>
          <p className="text-sm text-parchment-dark relative z-10">
            Toda a regra do jogo na palma da mão.
          </p>
        </Link>
      </div>
    </div>
  );
}
