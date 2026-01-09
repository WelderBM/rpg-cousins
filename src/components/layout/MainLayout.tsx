"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sword,
  BookOpen,
  Scroll,
  ShieldAlert,
  Wand2,
  Users,
  User,
  ShoppingBag,
  Home,
  Menu,
  X,
  LayoutGrid,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { name: "Home", href: "/", icon: Home, mobileLabel: "Home" },
  { name: "Heróis", href: "/herois", icon: User, mobileLabel: "Heróis" },
  {
    name: "Conhecer",
    href: "/conhecimentos",
    icon: Brain,
    mobileLabel: "Conhecer",
  },
  { name: "Mestre", href: "/mestre", icon: ShieldAlert, mobileLabel: "Mestre" },
];

const secondaryNavItems = [
  {
    name: "Mercado",
    href: "/market",
    icon: ShoppingBag,
    description: "Compre e venda equipamentos",
    color: "from-emerald-400 to-teal-600",
  },
];

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

import UserMenu from "@/components/auth/UserMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showSecondaryMenu, setShowSecondaryMenu] = React.useState(false);

  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Close menus on route change
    setShowMobileMenu(false);
    setShowSecondaryMenu(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-medieval-stone text-parchment-DEFAULT">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-medieval-stone/95 border-b border-medieval-iron/50 relative z-50 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl font-bold text-medieval-gold tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            RPG{" "}
            <span className="text-parchment-DEFAULT font-light">COUSINS</span>
          </h1>
        </div>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            showMobileMenu
              ? "bg-medieval-gold text-black scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              : "text-medieval-gold border border-medieval-gold/30 bg-black/20"
          )}
        >
          {showMobileMenu ? <X size={20} /> : <User size={20} />}
        </button>
      </header>

      {/* Mobile Profile Dropdown (Legacy location, kept for logic but styled better) */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 right-4 z-50 w-72 bg-medieval-stone/98 border border-medieval-gold/20 shadow-2xl rounded-2xl overflow-hidden p-2 backdrop-blur-xl"
          >
            <UserMenu />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Menu (Grid of Items) */}
      <AnimatePresence>
        {showSecondaryMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-medieval-gold tracking-widest">
                MENU PRINCIPAL
              </h2>
              <button
                onClick={() => setShowSecondaryMenu(false)}
                className="p-3 rounded-full bg-white/5 text-medieval-gold border border-medieval-gold/20"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 transition-all active:scale-95"
                  onClick={() => setShowSecondaryMenu(false)}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                      item.color
                    )}
                  >
                    <item.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="block font-serif text-lg font-bold text-parchment-DEFAULT leading-tight">
                      {item.name}
                    </span>
                    <span className="block text-[10px] text-parchment-dark/70 font-sans uppercase tracking-tighter mt-1">
                      {item.description}
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <item.icon size={64} />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 pb-12">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 text-parchment-light transition-all active:scale-95"
                  onClick={() => setShowSecondaryMenu(false)}
                >
                  <item.icon size={18} className="text-medieval-gold/60" />
                  <span className="font-serif text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-medieval-iron bg-medieval-stone/90 p-4 shadow-xl z-10 shrink-0">
        <div className="mb-10 mt-4 text-center">
          <h1 className="font-serif text-3xl font-bold text-medieval-gold tracking-widest drop-shadow-md">
            RPG
            <br />
            <span className="text-xl text-parchment-DEFAULT">Cousins</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-2 mt-4 px-2">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl p-3 px-4 transition-all duration-300",
                  isActive
                    ? "bg-medieval-gold/15 text-medieval-gold shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]"
                    : "text-parchment-dark hover:bg-white/5 hover:text-parchment-DEFAULT"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-bg"
                    className="absolute inset-0 rounded-xl bg-medieval-gold/5 border border-medieval-gold/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 transition-transform duration-300",
                    item.name === "Conhecer" ? "h-6 w-6" : "h-5 w-5",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={cn(
                    "font-serif text-lg relative z-10 tracking-wide",
                    isActive ? "font-bold" : "font-medium"
                  )}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute left-0 h-8 w-1 bg-medieval-gold rounded-r shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <UserMenu />
      </aside>

      {/* Main Content */}
      <main
        id="main-scroll-container"
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-medieval-stone to-[#12100e]"
        onClick={() => setShowMobileMenu(false)}
      >
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-overlay"></div>

        <div className="relative z-10 pb-24 md:pb-0 min-h-full w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-5 left-4 right-4 h-20 rounded-3xl border border-white/10 bg-[#0c0a09]/95 backdrop-blur-2xl flex justify-between items-center z-50 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        <div className="flex w-full justify-around items-center h-full">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full relative group transition-all"
              >
                <div
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 transition-all duration-300",
                    isActive ? "text-medieval-gold" : "text-parchment-dark/70"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-2xl mb-0.5 relative transition-all duration-500 shrink-0",
                      isActive && "bg-medieval-gold/10 scale-110"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-indicator-glow"
                        className="absolute inset-0 rounded-2xl bg-medieval-gold/20 blur-md"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "relative z-10",
                        item.name === "Conhecer" ? "h-7 w-7" : "h-6 w-6"
                      )}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-serif uppercase tracking-widest font-black transition-all",
                      isActive
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75 h-0 overflow-hidden"
                    )}
                  >
                    {item.mobileLabel}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-bar"
                    className="absolute bottom-1 w-1 h-1 bg-medieval-gold rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]"
                  />
                )}
              </Link>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setShowSecondaryMenu(true)}
            className="flex flex-col items-center justify-center flex-1 h-full relative group"
          >
            <div className="text-parchment-dark/70 p-2 flex flex-col items-center gap-1">
              <div className="p-2">
                <LayoutGrid className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] font-serif uppercase tracking-widest font-black opacity-0 h-0 overflow-hidden">
                MAIS
              </span>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
}
