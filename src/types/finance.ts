
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface DateFilter {
  startDate: Date | null;
  endDate: Date | null;
}

export interface FilterOptions {
  category?: string;
  dateRange?: DateFilter;
  type?: TransactionType;
}
