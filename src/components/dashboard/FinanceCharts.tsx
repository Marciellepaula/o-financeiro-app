
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/finance';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, 
  TooltipProps 
} from 'recharts';
import { formatCurrency } from '@/utils/financeUtils';
import { parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns';

interface FinanceChartsProps {
  transactions: Transaction[];
}

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

export function FinanceCharts({ transactions }: FinanceChartsProps) {
  // Colors for the pie chart
  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4'];

  // Prepare data for the category pie chart (expenses only)
  const categoryData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};

    expenseTransactions.forEach((transaction) => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = 0;
      }
      categories[transaction.category] += transaction.amount;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Prepare monthly data for the bar chart
  const monthlyData = useMemo(() => {
    // If there are no transactions, return empty array
    if (transactions.length === 0) return [];
    
    // Find the date range from transactions
    const dates = transactions.map(t => parseISO(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Ensure we have at least the current month
    const today = new Date();
    const adjustedMinDate = minDate < startOfMonth(today) ? minDate : startOfMonth(today);
    const adjustedMaxDate = maxDate > today ? maxDate : today;
    
    // Generate months in the date range
    const months = eachMonthOfInterval({
      start: startOfMonth(adjustedMinDate),
      end: endOfMonth(adjustedMaxDate),
    });
    
    // Create data for each month
    return months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseISO(t.date);
        return isSameMonth(transactionDate, month);
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: format(month, 'MMM'),
        income,
        expense,
      };
    });
  }, [transactions]);

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-popover border border-border rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value as number)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Expense by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No expense data to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Income & Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#4ade80" />
                  <Bar dataKey="expense" name="Expenses" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No monthly data to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
