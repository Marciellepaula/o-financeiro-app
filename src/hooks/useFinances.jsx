import { useState, useEffect } from 'react';
import { filterTransactions } from '@/utils/financeUtils';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Initial sample data
const initialCategories = [
  { id: '1', name: 'Salary', type: 'income' },
  { id: '2', name: 'Freelance', type: 'income' },
  { id: '3', name: 'Investment', type: 'income' },
  { id: '4', name: 'Gift', type: 'income' },
  { id: '5', name: 'Food', type: 'expense' },
  { id: '6', name: 'Housing', type: 'expense' },
  { id: '7', name: 'Transportation', type: 'expense' },
  { id: '8', name: 'Entertainment', type: 'expense' },
  { id: '9', name: 'Utilities', type: 'expense' },
  { id: '10', name: 'Health', type: 'expense' },
  { id: '11', name: 'Education', type: 'expense' },
  { id: '12', name: 'Shopping', type: 'expense' },
];

const initialTransactions = [
  {
    id: '1',
    amount: 5000,
    description: 'Monthly salary',
    category: 'Salary',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'income',
  },
  {
    id: '2',
    amount: 500,
    description: 'Freelance project',
    category: 'Freelance',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'income',
  },
  {
    id: '3',
    amount: 120.5,
    description: 'Grocery shopping',
    category: 'Food',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
  },
  {
    id: '4',
    amount: 850,
    description: 'Rent',
    category: 'Housing',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
  },
];

const useFinances = () => {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
  });
  
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : initialCategories;
  });
  
  const [filters, setFilters] = useState({});
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Update filtered transactions whenever transactions or filters change
  useEffect(() => {
    setFilteredTransactions(filterTransactions(transactions, filters));
  }, [transactions, filters]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
    };
    
    setTransactions([...transactions, newTransaction]);
    toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully`);
  };

  const importTransactionsFromPdf = (extractedTransactions) => {
    if (!extractedTransactions || extractedTransactions.length === 0) {
      toast.error('No valid transactions found in PDF');
      return;
    }
    
    // Add IDs to all imported transactions
    const newTransactions = extractedTransactions.map(transaction => ({
      ...transaction,
      id: uuidv4()
    }));
    
    setTransactions(prev => [...prev, ...newTransactions]);
    toast.success(`Imported ${newTransactions.length} transactions from PDF`);
  };

  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );
    toast.success('Transaction updated successfully');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
    toast.success('Transaction deleted successfully');
  };

  const addCategory = (categoryName, type) => {
    const exists = categories.some(category => 
      category.name.toLowerCase() === categoryName.toLowerCase() && category.type === type
    );

    if (exists) {
      toast.error('Category already exists');
      return;
    }

    const newCategory = {
      id: uuidv4(),
      name: categoryName,
      type,
    };
    
    setCategories([...categories, newCategory]);
    toast.success('Category added successfully');
  };

  const deleteCategory = (id) => {
    // Check if category is in use
    const isInUse = transactions.some(transaction => {
      const category = categories.find(c => c.id === id);
      return category && transaction.category === category.name;
    });

    if (isInUse) {
      toast.error('Cannot delete category that is in use');
      return;
    }

    setCategories(categories.filter((category) => category.id !== id));
    toast.success('Category deleted successfully');
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    transactions,
    filteredTransactions,
    categories,
    filters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    updateFilters,
    resetFilters,
    importTransactionsFromPdf,
  };
};

export default useFinances;
