import type { Category, Expense, Theme } from "./types";
import { DEFAULT_CATEGORIES } from "./defaultData";

const KEYS = {
  expenses: "em-expenses",
  categories: "em-categories",
  theme: "em-theme",
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getExpenses: (): Expense[] => get<Expense[]>(KEYS.expenses, []),
  setExpenses: (expenses: Expense[]): void => set(KEYS.expenses, expenses),

  getCategories: (): Category[] => {
    const raw = localStorage.getItem(KEYS.categories);
    if (!raw) {
      set(KEYS.categories, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    try {
      return JSON.parse(raw) as Category[];
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
  setCategories: (cats: Category[]): void => set(KEYS.categories, cats),

  getTheme: (): Theme => get<Theme>(KEYS.theme, "light"),
  setTheme: (theme: Theme): void => set(KEYS.theme, theme),
};
