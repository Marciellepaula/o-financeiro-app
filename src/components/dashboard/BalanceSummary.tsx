
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/finance';
import { calculateBalance, calculateTotalByType, formatCurrency } from '@/utils/financeUtils';

interface BalanceSummaryProps {
  transactions: Transaction[];
}

export function BalanceSummary({ transactions }: BalanceSummaryProps) {
  const totalIncome = calculateTotalByType(transactions, 'income');
  const totalExpense = calculateTotalByType(transactions, 'expense');
  const balance = calculateBalance(transactions);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-finance-income">{formatCurrency(totalIncome)}</div>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-finance-expense">{formatCurrency(totalExpense)}</div>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
