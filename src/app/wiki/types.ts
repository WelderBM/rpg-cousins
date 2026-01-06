export type Category =
  | "magias"
  | "equipamentos"
  | "poderes"
  | "racas"
  | "mercado"
  | "origens"
  | "divindades"
  | "classes";

export interface ItemBase {
  id: string;
  name: string;
  category: Category;
  type?: string;
  subType?: string;
  description?: string;
  raw: any;
}
