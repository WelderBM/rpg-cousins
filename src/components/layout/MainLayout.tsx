"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sword, BookOpen, Scroll, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Personagem", href: "/", icon: Sword },
  { name: "Grimório", href: "/grimorio", icon: BookOpen },
  { name: "Wiki", href: "/wiki", icon: Scroll },
  { name: "Mestre", href: "/admin", icon: ShieldAlert },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-medieval-stone">
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

        <div className="mt-auto pt-6 border-t border-medieval-iron/50 text-center">
          <p className="text-xs text-parchment-dark/60 font-serif">
            Tormenta 20 System
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-medieval-stone to-[#12100e]">
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-overlay"></div>

        <div className="relative z-10 p-4 md:p-8 pb-24 md:pb-8 min-h-full">
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
