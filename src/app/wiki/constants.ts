import {
  Zap,
  Shield,
  Book,
  Users,
  ShoppingBag,
  MapPin,
  Sparkles,
  Sword,
} from "lucide-react";
import { Category } from "./types";

export const CATEGORIES: {
  id: Category;
  label: string;
  icon: any;
  color: string;
  bg: string;
}[] = [
  {
    id: "magias",
    label: "Magias",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "equipamentos",
    label: "Equipamentos",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: "poderes",
    label: "Poderes",
    icon: Book,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    id: "racas",
    label: "Raças",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    id: "classes",
    label: "Classes",
    icon: Sword,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    id: "origens",
    label: "Origens",
    icon: MapPin,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    id: "divindades",
    label: "Divindades",
    icon: Sparkles,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    id: "mercado",
    label: "Mercado",
    icon: ShoppingBag,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export const ITEMS_PER_PAGE = 24;
