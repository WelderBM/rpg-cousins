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
  {
    name: "Mercado",
    href: "/market",
    icon: ShoppingBag,
    description: "Compre e venda equipamentos",
    color: "from-emerald-400 to-teal-600",
  },
  { name: "Mestre", href: "/mestre", icon: ShieldAlert, mobileLabel: "Mestre" },
];

const allNavItems = [...primaryNavItems];

import UserMenu from "@/components/auth/UserMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showDrawer, setShowDrawer] = React.useState(false);

  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Close menus on route change
    setShowMobileMenu(false);
    setShowDrawer(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-medieval-stone text-parchment-DEFAULT">
      {/* Mobile Header - Minimalist */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-medieval-stone/95 border-b border-medieval-iron/50 relative z-[70] shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold text-medieval-gold tracking-[0.1em]">
            RPG{" "}
            <span className="text-parchment-DEFAULT font-light">COUSINS</span>
          </h1>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="p-1.5 rounded-xl border border-medieval-gold/30 bg-black/20 text-medieval-gold active:scale-90 transition-transform"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Side Drawer (For Profile & Secondary Links) */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-medieval-stone z-[90] border-l border-medieval-gold/20 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-medieval-iron/50 flex justify-between items-center">
                <span className="font-serif text-lg font-bold text-medieval-gold uppercase tracking-widest">
                  Painel
                </span>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 text-parchment-dark"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* User Info Section */}
                <div className="bg-black/20 rounded-2xl p-4 border border-medieval-gold/10">
                  <UserMenu />
                </div>

                {/* Primary Copy for Drawer (Accessibility) */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-parchment-dark/50 px-2">
                    Navegação
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {primaryNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowDrawer(false)}
                        className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-parchment-DEFAULT text-sm font-serif"
                      >
                        <item.icon
                          size={16}
                          className="text-medieval-gold/60"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-medieval-iron/30 text-center">
                <span className="text-[10px] text-parchment-dark/40 uppercase tracking-widest">
                  RPG Cousins v2.0
                </span>
              </div>
            </motion.div>
          </>
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
      >
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-overlay"></div>

        <div className="relative z-10 md:pb-0 w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
