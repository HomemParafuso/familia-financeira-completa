
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinance } from '@/contexts/FinanceContext';
import { Category } from '@/types/finance';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  type: z.enum(['income', 'expense'], {
    required_error: 'Por favor selecione um tipo de categoria.',
  }),
  color: z.string().min(4, {
    message: 'Por favor selecione uma cor.',
  }),
  icon: z.string().default('default-icon'),
});

interface CategoryFormProps {
  initialData?: Category;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onClose }) => {
  const { addCategory, updateCategory } = useFinance();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      type: 'expense',
      color: '#6E56CF', // Cor padrão
      icon: 'default-icon',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateCategory({
        ...initialData,
        ...values,
      });
    } else {
      addCategory(values);
    }
    onClose();
  };

  const predefinedColors = [
    { name: 'Roxo', value: '#6E56CF' },
    { name: 'Azul', value: '#0091FF' },
    { name: 'Verde', value: '#17C964' },
    { name: 'Amarelo', value: '#F5A524' },
    { name: 'Vermelho', value: '#F31260' },
    { name: 'Rosa', value: '#FF4ECD' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da categoria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <div className="grid grid-cols-6 gap-2">
                {predefinedColors.map((color) => (
                  <div 
                    key={color.value}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      field.value === color.value ? 'border-black dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => form.setValue('color', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-finance-primary hover:bg-finance-primary/90">
            {initialData ? 'Atualizar' : 'Criar'} Categoria
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
