"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const { clearActiveCharacter } = useCharacterStore();
  const { setUser: setGlobalUser } = useStore();
  const router = useRouter();

  // State for Master Login
  const [showMasterLogin, setShowMasterLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe: any;
    // Dynamic import for firebase auth to avoid SSR issues if any
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setGlobalUser(currentUser);
        });
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setGlobalUser]);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === "auth/configuration-not-found") {
        alert(
          "Erro de Configuração Firebase: O provedor de login Google não está ativado no Console do Firebase.\n\nPor favor, ative-o em: Authentication > Sign-in method > Google."
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        // Ignore normal close
      } else {
        alert(`Erro ao fazer login: ${error.message}`);
      }
    }
  };

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      // Login successful, auth state listener will handle the rest
      setShowMasterLogin(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Master Login Error:", error);
      alert("Falha no login de Mestre: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    clearActiveCharacter();
    setGlobalUser(null);
    router.push("/");
  };

  if (!user) {
    return (
      <div className="px-4 py-4 border-t border-medieval-iron/30 flex flex-col gap-3">
        {!showMasterLogin ? (
          <>
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-lg bg-medieval-gold hover:bg-amber-600 text-black font-bold transition-all shadow-lg active:scale-95"
            >
              <LogIn size={20} />
              <span className="font-serif">Entrar com Google</span>
            </button>
            <button
              onClick={() => setShowMasterLogin(true)}
              className="text-xs text-medieval-iron hover:text-parchment-light transition-colors underline decoration-dashed underline-offset-4"
            >
              Sou o Mestre (Login Especial)
            </button>
          </>
        ) : (
          <form
            onSubmit={handleMasterLogin}
            className="bg-black/40 p-3 rounded-lg border border-medieval-gold/30 space-y-3"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-serif text-medieval-gold uppercase">
                Acesso do Mestre
              </span>
              <button
                type="button"
                onClick={() => setShowMasterLogin(false)}
                className="text-neutral-500 hover:text-red-400"
              >
                <LogOut size={12} />
              </button>
            </div>
            <input
              type="email"
              placeholder="Email do Mestre"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/60 border border-medieval-iron/50 rounded p-2 text-xs text-parchment-light focus:border-medieval-gold"
              required
            />
            <input
              type="password"
              placeholder="Senha Secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-medieval-iron/50 rounded p-2 text-xs text-parchment-light focus:border-medieval-gold"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-medieval-gold/20 border border-medieval-gold/50 text-medieval-gold hover:bg-medieval-gold hover:text-black rounded text-xs font-bold uppercase transition-all"
            >
              {loading ? "Entrando..." : "Acessar Grimório"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-medieval-iron/30 bg-black/20 p-4">
      <div className="flex items-center gap-3 mb-4">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-10 h-10 rounded-full border-2 border-medieval-gold"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-medieval-stone border-2 border-medieval-gold flex items-center justify-center">
            <UserIcon size={20} className="text-medieval-gold" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-parchment-light truncate font-serif">
            {user.displayName || user.email?.split("@")[0] || "Viajante"}
          </p>
          <p className="text-[10px] text-parchment-dark truncate opacity-70">
            {user.email}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-lg border border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/30 hover:border-red-900/60 transition-all text-xs font-bold uppercase tracking-wider"
      >
        <LogOut size={14} />
        Sair
      </button>
    </div>
  );
}
