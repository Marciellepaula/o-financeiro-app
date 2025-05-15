
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BalanceSummary } from '@/components/dashboard/BalanceSummary';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { FinanceCharts } from '@/components/dashboard/FinanceCharts';
import { CategoryManager } from '@/components/categories/CategoryManager';
import useFinances from '@/hooks/useFinances';
import { exportToCSV } from '@/utils/financeUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusIcon, DownloadIcon } from '@/components/ui/icons';

export default function Dashboard() {
  const {
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
  } = useFinances();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleAddTransaction = (data: any) => {
    addTransaction(data);
    handleCloseAddDialog();
  };

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1">
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleOpenAddDialog} size="sm" className="gap-1">
            <PlusIcon className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <BalanceSummary transactions={filteredTransactions} />

      <FinanceCharts transactions={filteredTransactions} />

      <div className="mt-6">
        <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <div className="mt-4">
              <TransactionFilters
                categories={categories}
                currentFilters={filters}
                onFilterChange={updateFilters}
                onResetFilters={resetFilters}
              />
              <TransactionsList
                transactions={filteredTransactions}
                categories={categories}
                onUpdate={updateTransaction}
                onDelete={deleteTransaction}
              />
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="mt-4">
              <CategoryManager
                categories={categories}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleAddTransaction}
            categories={categories}
            onCancel={handleCloseAddDialog}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
