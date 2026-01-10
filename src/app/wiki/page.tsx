"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAllSpells,
  getAllEquipments,
  getAllRaces,
  getAllPowers,
  getAllOrigins,
  getAllDivindades,
  getAllClasses,
} from "@/lib/localData";
import { ItemBase, Category } from "./types";
import { WikiSidebar } from "./components/WikiSidebar";
import { WikiMobileTopBar } from "./components/WikiMobileTopBar";
import { WikiCategoryNav } from "./components/WikiCategoryNav";
import { WikiControls } from "./components/WikiControls";
import { WikiGrid } from "./components/WikiGrid";
import { WikiDetailDrawer } from "./components/WikiDetailDrawer";
import { FloatingBackButton } from "@/components/FloatingBackButton";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 24;

export default function WikiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <WikiContent />
    </Suspense>
  );
}

interface WikiContentProps {
  isEmbedded?: boolean;
}

export function WikiContent({ isEmbedded = false }: WikiContentProps) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("magias");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemBase | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Data State
  const [data, setData] = useState<Record<Category, ItemBase[]>>({
    magias: [],
    equipamentos: [],
    racas: [],
    poderes: [],
    mercado: [],
    origens: [],
    divindades: [],
    classes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter States - Magias
  const [spellCircle, setSpellCircle] = useState<number | "all">("all");
  const [spellSchool, setSpellSchool] = useState<string | "all">("all");
  const [spellExecution, setSpellExecution] = useState<string | "all">("all");
  const [spellRange, setSpellRange] = useState<string | "all">("all");
  const [spellDuration, setSpellDuration] = useState<string | "all">("all");
  const [spellTarget, setSpellTarget] = useState("");

  // Filter States - Outros
  const [equipGroup, setEquipGroup] = useState<string | "all">("all");
  const [powerType, setPowerType] = useState<string | "all">("all");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [equipSubGroup, setEquipSubGroup] = useState<string | "all">("all");

  // Initial URL handling (Only on mount)
  useEffect(() => {
    const cat = searchParams.get("cat") as Category;
    if (cat && data[cat] !== undefined) {
      setActiveCategory(cat);
    }
  }, []); // Only on mount

  // Select item from URL once data is loaded for that category
  useEffect(() => {
    const id = searchParams.get("id");
    const cat = (searchParams.get("cat") || activeCategory) as Category;

    if (id && data[cat] && data[cat].length > 0) {
      const item = data[cat].find((i) => i.id === id);
      if (item && selectedItem?.id !== id) {
        setSelectedItem(item);
      }
    }
  }, [data, activeCategory]); // Trigger when data for a category is loaded

  // Reset limit when category or search changes
  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery]);

  // Sync URL with selection (Without causing loops)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentCat = params.get("cat");
    const currentId = params.get("id");

    if (
      currentCat !== activeCategory ||
      currentId !== (selectedItem?.id || null)
    ) {
      params.set("cat", activeCategory);
      if (selectedItem) {
        params.set("id", selectedItem.id);
      } else {
        params.delete("id");
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [selectedItem, activeCategory]);

  // Load data for active category
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // If we already have data for this category, don't re-fetch
      if (data[activeCategory].length > 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let items: ItemBase[] = [];

        if (activeCategory === "magias") {
          const rawSpells = await getAllSpells();
          items = rawSpells.map((s) => ({
            id: `spell-${s.nome}`,
            name: s.nome,
            category: "magias" as Category,
            type: `${s.school} • ${s.spellCircle}`,
            description: s.execucao + " | " + s.alcance,
            raw: s,
          }));
        } else if (activeCategory === "equipamentos") {
          const rawEquips = await getAllEquipments();
          items = rawEquips.map((e) => ({
            id: `equip-${e.nome}`,
            name: e.nome,
            category: "equipamentos" as Category,
            type: e.subGroup || e.group,
            subType: e.subGroup,
            description: `T$ ${e.preco} • ${e.spaces} esp.`,
            raw: e,
          }));
        } else if (activeCategory === "racas") {
          const rawRaces = await getAllRaces();
          items = rawRaces.map((r) => {
            const attrs = r.attributes.attrs
              .map((a) => `${a.mod > 0 ? "+" : ""}${a.mod} ${a.attr}`)
              .join(", ");
            return {
              id: `race-${r.name}`,
              name: r.name,
              category: "racas" as Category,
              type: "Raça Jogável",
              description: `Bônus: ${attrs}`,
              raw: r,
            };
          });
        } else if (activeCategory === "poderes") {
          const rawPowers = await getAllPowers();
          items = rawPowers.map((p) => ({
            id: `power-${p.name}`,
            name: p.name,
            category: "poderes" as Category,
            type: p.type,
            description: p.description,
            raw: p,
          }));
        } else if (activeCategory === "mercado") {
          const rawEquips = await getAllEquipments();
          items = rawEquips.map((e) => ({
            id: `mercado-${e.nome}`,
            name: e.nome,
            category: "mercado" as Category,
            type: e.subGroup || e.group,
            subType: e.subGroup,
            description: `T$ ${e.preco} • ${e.spaces} esp.`,
            raw: e,
          }));
        } else if (activeCategory === "origens") {
          const rawOrigins = await getAllOrigins();
          items = rawOrigins.map((o) => ({
            id: `origin-${o.name}`,
            name: o.name,
            category: "origens" as Category,
            type: "Origem de Personagem",
            description: `Perícias: ${o.pericias.join(", ")}`,
            raw: o,
          }));
        } else if (activeCategory === "divindades") {
          const rawDeities = await getAllDivindades();
          items = rawDeities.map((d) => ({
            id: `deity-${d.name}`,
            name: d.name,
            category: "divindades" as Category,
            type: "Divindade do Panteão",
            description: `${d.crencasObjetivos.slice(0, 100)}... | Símbolo: ${
              d.simboloSagrado
            }`,
            raw: d,
          }));
        } else if (activeCategory === "classes") {
          const rawClasses = await getAllClasses();
          items = rawClasses.map((c) => ({
            id: `class-${c.name}`,
            name: c.name,
            category: "classes" as Category,
            type: "Classe de Personagem",
            description: c.description,
            raw: c,
          }));
        }

        if (isMounted) {
          setData((prev) => ({ ...prev, [activeCategory]: items }));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading wiki data:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, data]);

  // Filtering
  const filteredItems = useMemo(() => {
    let items = data[activeCategory];

    // Category Specific Filters
    if (activeCategory === "magias") {
      if (spellCircle !== "all") {
        items = items.filter((i) => {
          const circleValue = i.raw.spellCircle;
          return circleValue.includes(`${spellCircle}º`);
        });
      }
      if (spellSchool !== "all") {
        items = items.filter((i) => i.raw.school === spellSchool);
      }
      if (spellExecution !== "all") {
        items = items.filter((i) => i.raw.execucao.includes(spellExecution));
      }
      if (spellRange !== "all") {
        items = items.filter((i) => i.raw.alcance.includes(spellRange));
      }
      if (spellDuration !== "all") {
        items = items.filter((i) =>
          i.raw.duracao.toLowerCase().includes(spellDuration.toLowerCase())
        );
      }
      if (spellTarget !== "") {
        const target = spellTarget.toLowerCase();
        items = items.filter(
          (i) =>
            (i.raw.alvo && i.raw.alvo.toLowerCase().includes(target)) ||
            (i.raw.area && i.raw.area.toLowerCase().includes(target))
        );
      }
    }

    if (activeCategory === "equipamentos" || activeCategory === "mercado") {
      if (equipGroup !== "all") {
        items = items.filter((i) => i.raw.group === equipGroup);
      }
      if (equipSubGroup !== "all") {
        items = items.filter((i) => i.subType === equipSubGroup);
      }
      if (maxPrice !== "") {
        items = items.filter((i) => i.raw.preco <= maxPrice);
      }
    }

    if (activeCategory === "poderes") {
      if (powerType !== "all") {
        items = items.filter(
          (i) => i.raw.type === powerType || i.type === powerType
        );
      }
    }

    // Search Query
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.type?.toLowerCase().includes(query) ||
        (i.description && i.description.toLowerCase().includes(query))
    );
  }, [
    data,
    activeCategory,
    searchQuery,
    spellCircle,
    spellSchool,
    spellExecution,
    spellRange,
    spellDuration,
    spellTarget,
    equipGroup,
    equipSubGroup,
    maxPrice,
    powerType,
  ]);

  // Handlers
  const handleCopyLink = (item: ItemBase) => {
    const url = `${window.location.origin}/wiki?cat=${item.category}&id=${item.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSpellCircle("all");
    setSpellSchool("all");
    setSpellExecution("all");
    setSpellRange("all");
    setSpellDuration("all");
    setSpellTarget("");
    setEquipGroup("all");
    setEquipSubGroup("all");
    setPowerType("all");
    setMaxPrice("");
    setSearchQuery("");
  };

  return (
    <div
      className={cn(
        "h-full text-neutral-200 font-sans selection:bg-amber-500/30",
        isEmbedded ? "bg-transparent" : "bg-stone-950"
      )}
    >
      {!isEmbedded && <FloatingBackButton />}
      <div
        className={cn(
          "flex flex-col md:flex-row",
          isEmbedded ? "" : "h-full overflow-hidden"
        )}
      >
        {/* Desktop Sidebar (hidden on mobile) */}
        {!isEmbedded && (
          <WikiSidebar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 flex flex-col relative",
            isEmbedded ? "" : "overflow-y-auto custom-scrollbar"
          )}
        >
          {/* Mobile Top Bar */}
          {!isEmbedded && <WikiMobileTopBar />}

          {/* Mobile Category Nav (Sticky below top bar) */}
          <WikiCategoryNav
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isEmbedded={isEmbedded}
          />

          {/* Search & Filters */}
          <WikiControls
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFiltersOpen={isFiltersOpen}
            setIsFiltersOpen={setIsFiltersOpen}
            filteredCount={filteredItems.length}
            spellCircle={spellCircle}
            setSpellCircle={setSpellCircle}
            spellSchool={spellSchool}
            setSpellSchool={setSpellSchool}
            spellExecution={spellExecution}
            setSpellExecution={setSpellExecution}
            spellRange={spellRange}
            setSpellRange={setSpellRange}
            spellDuration={spellDuration}
            setSpellDuration={setSpellDuration}
            spellTarget={spellTarget}
            setSpellTarget={setSpellTarget}
            equipGroup={equipGroup}
            setEquipGroup={setEquipGroup}
            equipSubGroup={equipSubGroup}
            setEquipSubGroup={setEquipSubGroup}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            powerType={powerType}
            setPowerType={setPowerType}
            resetFilters={resetFilters}
            isEmbedded={isEmbedded}
          />

          {/* Grid Layout */}
          <WikiGrid
            isLoading={isLoading}
            filteredItems={filteredItems}
            displayLimit={displayLimit}
            setDisplayLimit={setDisplayLimit}
            setSelectedItem={setSelectedItem}
            copiedId={copiedId}
            handleCopyLink={handleCopyLink}
          />

          {/* Detail Drawer */}
          <WikiDetailDrawer
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            copiedId={copiedId}
            handleCopyLink={handleCopyLink}
          />
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.2);
        }
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
        }
        .sidebar-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.2);
        }
        .font-cinzel {
          font-family: "Cinzel", serif;
        }
      `}</style>
    </div>
  );
}
