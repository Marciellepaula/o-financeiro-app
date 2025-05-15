
import { Transaction, TransactionType, FilterOptions } from '@/types/finance';
import { format, isWithinInterval, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => {
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);
};

export const calculateTotalByType = (
  transactions: Transaction[],
  type: TransactionType
): number => {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
};

export const filterTransactions = (
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Filter by category
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    // Filter by transaction type
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate)) {
      const transactionDate = parseISO(transaction.date);
      
      // If we have both start and end date
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        return isWithinInterval(transactionDate, {
          start: filters.dateRange.startDate,
          end: filters.dateRange.endDate,
        });
      }
      
      // If we only have start date
      if (filters.dateRange.startDate && !filters.dateRange.endDate) {
        return transactionDate >= filters.dateRange.startDate;
      }
      
      // If we only have end date
      if (!filters.dateRange.startDate && filters.dateRange.endDate) {
        return transactionDate <= filters.dateRange.endDate;
      }
    }

    return true;
  });
};

export const groupTransactionsByMonth = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((grouped, transaction) => {
    const date = parseISO(transaction.date);
    const monthYear = format(date, 'MM/yyyy');
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(transaction);
    return grouped;
  }, {} as Record<string, Transaction[]>);
};

export const getUniqueCategories = (transactions: Transaction[]): string[] => {
  const categoriesSet = new Set<string>();
  
  transactions.forEach((transaction) => {
    categoriesSet.add(transaction.category);
  });
  
  return Array.from(categoriesSet);
};

export const exportToCSV = (transactions: Transaction[]): void => {
  // Define the CSV header
  const header = 'ID,Amount,Description,Category,Date,Type';
  
  // Convert transactions to CSV rows
  const rows = transactions.map((transaction) => {
    return `${transaction.id},${transaction.amount},"${transaction.description}","${transaction.category}",${transaction.date},${transaction.type}`;
  });
  
  // Combine header and rows
  const csv = [header, ...rows].join('\n');
  
  // Create a Blob and download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `finance-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
