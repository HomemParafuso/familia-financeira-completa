import React, { useState } from 'react';
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
import { Budget } from '@/types/finance';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGroup } from '@/contexts/GroupContext';

const formSchema = z.object({
  budgetType: z.enum(['category', 'global', 'member']),
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  amount: z.coerce.number().positive({
    message: 'O valor deve ser maior que zero.',
  }),
  period: z.enum(['weekly', 'monthly', 'yearly'], {
    required_error: "Por favor selecione um período.",
  }),
  startDate: z.date({
    required_error: "Data de início é obrigatória.",
  }),
  endDate: z.date().optional(),
});

type BudgetFormType = z.infer<typeof formSchema>;

interface BudgetFormProps {
  initialData?: Budget;
  onClose: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ initialData, onClose }) => {
  const { addBudget, updateBudget, categories } = useFinance();
  const { currentGroup } = useGroup();
  const [budgetType, setBudgetType] = useState<'category' | 'global' | 'member'>(
    initialData?.isGlobal ? 'global' : 
    initialData?.memberId ? 'member' : 'category'
  );
  
  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  
  // Obter membros do grupo atual
  const groupMembers = currentGroup?.members || [];
  
  // Converter as datas de string para objeto Date se houver dados iniciais
  const defaultValues: BudgetFormType = initialData 
    ? {
        budgetType: initialData.isGlobal ? 'global' : 
                   initialData.memberId ? 'member' : 'category',
        categoryId: initialData.categoryId,
        memberId: initialData.memberId,
        amount: initialData.amount,
        period: initialData.period,
        startDate: new Date(initialData.startDate),
        endDate: initialData.endDate ? new Date(initialData.endDate) : undefined
      }
    : {
        budgetType: 'category',
        categoryId: '',
        memberId: '',
        amount: 0,
        period: 'monthly' as const,
        startDate: new Date(),
      };

  const form = useForm<BudgetFormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedBudgetType = form.watch('budgetType');

  const onSubmit = (values: BudgetFormType) => {
    const { budgetType, categoryId, memberId, ...otherValues } = values;
    
    const budgetData: Omit<Budget, 'id'> = {
      ...otherValues,
      categoryId: budgetType === 'category' ? categoryId : undefined,
      memberId: budgetType === 'member' ? memberId : undefined,
      isGlobal: budgetType === 'global',
      startDate: values.startDate.toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : undefined,
      spent: initialData?.spent || 0,
      amount: values.amount,
      period: values.period,
    };

    if (initialData) {
      updateBudget({
        ...initialData,
        ...budgetData,
      });
    } else {
      addBudget(budgetData);
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="budgetType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Orçamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setBudgetType(value as 'category' | 'global' | 'member');
                  }}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="category" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Orçamento por Categoria
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="global" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Orçamento Global (toda família)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="member" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Orçamento por Membro
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedBudgetType === 'category' && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.length > 0 ? (
                      expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        Nenhuma categoria disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {selectedBudgetType === 'member' && (
          <FormField
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membro</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groupMembers.length > 0 ? (
                      groupMembers.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-members" disabled>
                        Nenhum membro disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Orçamento</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0,00" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseFloat(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Período</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período do orçamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Término (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      locale={ptBR}
                      initialFocus
                      fromDate={form.watch('startDate')}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-finance-primary hover:bg-finance-primary/90">
            {initialData ? 'Atualizar' : 'Criar'} Orçamento
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BudgetForm;
