export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export type Theme = "light" | "dark";
