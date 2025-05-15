
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { FilterOptions, Category, DateFilter } from '@/types/finance';
import { Badge } from '@/components/ui/badge';
import { FilterIcon, CloseIcon } from '@/components/ui/icons';

interface TransactionFiltersProps {
  categories: Category[];
  currentFilters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export function TransactionFilters({
  categories,
  currentFilters,
  onFilterChange,
  onResetFilters,
}: TransactionFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateFilter>({
    startDate: currentFilters.dateRange?.startDate || null,
    endDate: currentFilters.dateRange?.endDate || null,
  });

  const uniqueCategories = categories.map((category) => category.name);

  const handleDateRangeChange = (dateRange: DateFilter) => {
    setDateRange(dateRange);
    onFilterChange({ ...currentFilters, dateRange });
  };

  const handleTypeChange = (type: 'income' | 'expense' | '') => {
    if (type === '') {
      const { type, ...rest } = currentFilters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...currentFilters, type: type as 'income' | 'expense' });
    }
  };

  const handleCategoryChange = (category: string) => {
    if (category === '') {
      const { category, ...rest } = currentFilters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...currentFilters, category });
    }
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (!dateRange.startDate && !dateRange.endDate) return 'All dates';
    
    if (dateRange.startDate && dateRange.endDate) {
      return `${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`;
    }
    
    if (dateRange.startDate) {
      return `From ${format(dateRange.startDate, 'dd/MM/yyyy')}`;
    }
    
    if (dateRange.endDate) {
      return `Until ${format(dateRange.endDate, 'dd/MM/yyyy')}`;
    }

    return 'All dates';
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (currentFilters.category) count++;
    if (currentFilters.type) count++;
    if (currentFilters.dateRange?.startDate || currentFilters.dateRange?.endDate) count++;
    return count;
  };

  const activeFilterCount = countActiveFilters();

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={toggleFilters}
        >
          <FilterIcon className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {isFilterOpen && (
        <Card className="mt-2">
          <CardContent className="pt-4 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Transaction Type
                </label>
                <Select
                  value={currentFilters.type || ''}
                  onValueChange={(value) => handleTypeChange(value as 'income' | 'expense' | '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Select
                  value={currentFilters.category || ''}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Range
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !dateRange.startDate && !dateRange.endDate && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{formatDateRange()}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.startDate ?? new Date()}
                      selected={{
                        from: dateRange.startDate ?? undefined,
                        to: dateRange.endDate ?? undefined,
                      }}
                      onSelect={(range) => {
                        handleDateRangeChange({
                          startDate: range?.from ?? null,
                          endDate: range?.to ?? null,
                        });
                      }}
                      className="pointer-events-auto"
                      footer={
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDateRangeChange({ startDate: null, endDate: null })}
                            className="w-full"
                          >
                            Clear dates
                          </Button>
                        </div>
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {currentFilters.type && (
                  <Badge variant="secondary" className="gap-1">
                    {currentFilters.type === 'income' ? 'Income' : 'Expense'}
                    <button
                      onClick={() => handleTypeChange('')}
                      className="ml-1 hover:bg-muted/60 rounded-full"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove filter</span>
                    </button>
                  </Badge>
                )}

                {currentFilters.category && (
                  <Badge variant="secondary" className="gap-1">
                    {currentFilters.category}
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="ml-1 hover:bg-muted/60 rounded-full"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove filter</span>
                    </button>
                  </Badge>
                )}

                {(dateRange.startDate || dateRange.endDate) && (
                  <Badge variant="secondary" className="gap-1">
                    {formatDateRange()}
                    <button
                      onClick={() => handleDateRangeChange({ startDate: null, endDate: null })}
                      className="ml-1 hover:bg-muted/60 rounded-full"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove filter</span>
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
