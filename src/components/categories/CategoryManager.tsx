
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, TransactionType } from '@/types/finance';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrashIcon } from '@/components/ui/icons';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, type: TransactionType) => void;
  onDeleteCategory: (id: string) => void;
}

const categorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }).max(30),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryManager({
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('income');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = (values: CategoryFormValues) => {
    onAddCategory(values.name, activeTab);
    form.reset();
  };

  const filteredCategories = categories.filter((category) => category.type === activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Create and manage categories for your transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as TransactionType)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
          </TabsList>
          <TabsContent value="income" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <Badge key={category.id} variant="outline" className="py-1 px-3 flex items-center gap-2">
                    {category.name}
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="ml-1 hover:bg-muted/60 rounded-full h-4 w-4 inline-flex items-center justify-center"
                    >
                      <TrashIcon size={12} />
                      <span className="sr-only">Delete</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No income categories yet.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="expense" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <Badge key={category.id} variant="outline" className="py-1 px-3 flex items-center gap-2">
                    {category.name}
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="ml-1 hover:bg-muted/60 rounded-full h-4 w-4 inline-flex items-center justify-center"
                    >
                      <TrashIcon size={12} />
                      <span className="sr-only">Delete</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No expense categories yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>New Category Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Add new ${activeTab} category...`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm">
                Add Category
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
