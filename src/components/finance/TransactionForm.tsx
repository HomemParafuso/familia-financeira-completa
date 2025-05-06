
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Tags, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Transaction, RecurrencePeriod } from '@/types/finance';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';

interface TransactionFormProps {
  initialData?: Transaction;
  onClose: () => void;
  onSuccess?: (type: string, description: string) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onClose, onSuccess }) => {
  const { categories, addTransaction, updateTransaction, addCategory } = useFinance();
  const { user } = useAuth();
  const { currentGroup, canUserPerform } = useGroup();
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurring);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurrencePeriod>(
    (initialData?.recurring?.frequency as RecurrencePeriod) || 'monthly'
  );
  const [recurringMonths, setRecurringMonths] = useState<number>(
    initialData?.recurring?.months || 1
  );
  
  // Estado para o modal de nova categoria
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3498db');
  
  // Filter categories based on transaction type
  const filteredCategories = categories.filter(c => c.type === type);
  const hasCategoriesForType = filteredCategories.length > 0;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      date: date.toISOString(),
      createdBy: user.id,
      groupId: currentGroup?.id,
      tags,
      ...(isRecurring ? {
        recurring: {
          frequency: recurringFrequency,
          months: recurringMonths,
        }
      } : {})
    };
    
    if (initialData) {
      updateTransaction({
        ...initialData,
        ...transactionData,
      });
      
      if (onSuccess) {
        onSuccess(type, description);
      }
    } else {
      addTransaction(transactionData);
      
      if (onSuccess) {
        onSuccess(type, description);
      }
    }
    
    onClose();
  };
  
  // Manipulador para criar nova categoria
  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        name: newCategoryName.trim(),
        type,
        color: newCategoryColor,
        icon: type === 'expense' ? 'file-text' : 'file-text-2',
        groupId: currentGroup?.id
      };
      
      const result = addCategory(newCategory);
      // Only set categoryId if result is a string (the new category ID)
      if (result && typeof result === 'string') {
        setCategoryId(result);
      }
      setIsNewCategoryOpen(false);
      setNewCategoryName('');
    }
  };
  
  // Add tag to list
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };
  
  // Remove tag from list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input key events
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Update category when type changes
  useEffect(() => {
    const hasMatchingCategory = filteredCategories.some(c => c.id === categoryId);
    if (!hasMatchingCategory) {
      setCategoryId(filteredCategories[0]?.id || '');
    }
  }, [type]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as 'income' | 'expense')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Tipo de transação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Descrição da transação"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <div className="flex gap-2">
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value)}
                disabled={!hasCategoriesForType}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={hasCategoriesForType ? "Selecione uma categoria" : "Nenhuma categoria disponível"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  {!hasCategoriesForType && (
                    <SelectItem value="no-categories" disabled>
                      Nenhuma categoria disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              {canUserPerform('manage_categories') && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3" 
                  onClick={() => setIsNewCategoryOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'P', { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div>
          <Label>Etiquetas</Label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Adicione etiquetas..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={addTag}
                className="pl-10"
              />
            </div>
            <Button type="button" onClick={addTag}>
              Adicionar
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-gray-300 text-finance-primary focus:ring-finance-primary"
            />
            <Label htmlFor="recurring">Transação recorrente</Label>
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurringFrequency">Frequência</Label>
                <Select
                  value={recurringFrequency}
                  onValueChange={(value) => setRecurringFrequency(value as RecurrencePeriod)}
                >
                  <SelectTrigger id="recurringFrequency">
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recurringMonths">Duração (meses)</Label>
                <Input
                  id="recurringMonths"
                  type="number"
                  min="1"
                  max="60"
                  value={recurringMonths}
                  onChange={(e) => setRecurringMonths(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-finance-primary hover:bg-finance-primary/90">
          {initialData ? 'Atualizar' : 'Adicionar'} Transação
        </Button>
      </div>
      
      {/* Modal para nova categoria */}
      <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Nome
              </Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-color" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="color"
                  id="category-color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <span>{newCategoryColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateCategory} className="bg-finance-primary hover:bg-finance-primary/90">
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default TransactionForm;
