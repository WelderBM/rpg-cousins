"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Meu Herói", href: "/my-character", icon: User },
  { name: "Novo Personagem", href: "/wizard", icon: Wand2 },
  { name: "Poderes", href: "/grimorio", icon: BookOpen },
  { name: "Meus Heróis", href: "/characters", icon: Users },
  { name: "Mercado", href: "/market", icon: ShoppingBag }, // NEW: Added Market
  { name: "Wiki", href: "/wiki", icon: Scroll },
  { name: "Mestre", href: "/mestre", icon: ShieldAlert },
];

import UserMenu from "@/components/auth/UserMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-medieval-stone">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-medieval-stone/95 border-b border-medieval-iron/50 relative z-50 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold text-medieval-gold tracking-widest">
            RPG <span className="text-parchment-DEFAULT">Cousins</span>
          </h1>
        </div>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-medieval-gold border border-medieval-gold/30 rounded-lg bg-black/20 active:scale-95 transition-transform"
        >
          <User className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 right-4 z-50 w-72 bg-medieval-stone border border-medieval-iron shadow-2xl rounded-xl overflow-hidden p-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <UserMenu />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-medieval-iron bg-medieval-stone/90 p-4 shadow-xl z-10 shrink-0">
        <div className="mb-10 mt-4 text-center">
          <h1 className="font-serif text-3xl font-bold text-medieval-gold tracking-widest drop-shadow-md">
            RPG
            <br />
            <span className="text-xl text-parchment-DEFAULT">Cousins</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg p-3 transition-all duration-300",
                  isActive
                    ? "bg-medieval-gold/10 text-medieval-gold"
                    : "text-parchment-light hover:bg-white/5 hover:text-parchment-DEFAULT"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-bg"
                    className="absolute inset-0 rounded-lg bg-medieval-gold/5"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className="h-6 w-6 relative z-10"
                  strokeWidth={1.5}
                />
                <span className="font-serif text-lg relative z-10">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute left-0 h-full w-1 bg-medieval-gold rounded-r shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
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
      <nav className="flex md:hidden fixed bottom-6 left-4 right-4 h-16 rounded-2xl border border-medieval-iron/50 bg-medieval-stone/95 backdrop-blur-md justify-between items-center z-50 px-6 shadow-2xl ring-1 ring-white/5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-12 h-full relative group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-indicator"
                  className="absolute -top-3 w-10 h-1 bg-medieval-gold rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                />
              )}
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-medieval-gold/10 text-medieval-gold scale-110"
                    : "text-parchment-dark group-hover:text-parchment-light"
                )}
              >
                <item.icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
