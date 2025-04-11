
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard';
import { useFinance } from '@/contexts/FinanceContext';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import BudgetForm from '@/components/finance/BudgetForm';
import { Budget } from '@/types/finance';
import { toast } from 'sonner';

const BudgetsPage: React.FC = () => {
  const { budgets, categories, isLoading, deleteBudget } = useFinance();
  const { user } = useAuth();
  const { currentGroup, canUserPerform } = useGroup();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Verifica se o usuário pode editar orçamentos
  const canEditBudgets = canUserPerform('manage_categories');
  
  // Função para abrir o diálogo de criação
  const openBudgetDialog = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  // Função para abrir o diálogo de edição
  const openEditBudgetDialog = (budget: Budget) => {
    if (!canEditBudgets) {
      toast.error("Você não tem permissão para editar orçamentos");
      return;
    }
    
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  // Função para confirmar exclusão
  const confirmDeleteBudget = (budget: Budget) => {
    if (!canEditBudgets) {
      toast.error("Você não tem permissão para excluir orçamentos");
      return;
    }
    
    setSelectedBudget(budget);
    setIsDeleteConfirmOpen(true);
  };

  // Função para deletar o orçamento selecionado
  const handleDeleteBudget = () => {
    if (selectedBudget) {
      deleteBudget(selectedBudget.id);
      setIsDeleteConfirmOpen(false);
      setSelectedBudget(undefined);
    }
  };

  // Função para fechar o diálogo
  const closeBudgetDialog = () => {
    setIsDialogOpen(false);
    setSelectedBudget(undefined);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-finance-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos mensais por categoria</p>
        </div>
        <Button 
          className="bg-finance-primary hover:bg-finance-primary/90"
          onClick={openBudgetDialog}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          const progress = (budget.spent / budget.amount) * 100;
          const isOverBudget = budget.spent > budget.amount;

          return (
            <Card key={budget.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: category?.color || '#ccc' }} 
                    />
                    <CardTitle>{category?.name || 'Categoria'}</CardTitle>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm font-medium mr-2">
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                    </div>
                    
                    {canEditBudgets && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditBudgetDialog(budget)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDeleteBudget(budget)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {new Date(budget.startDate).toLocaleDateString('pt-BR')}
                  {budget.endDate ? ` até ${new Date(budget.endDate).toLocaleDateString('pt-BR')}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gasto: {budget.spent.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}</span>
                    <span className="text-sm font-medium">
                      de {budget.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </div>
                  <Progress
                    value={progress > 100 ? 100 : progress}
                    className={isOverBudget ? "bg-red-200" : ""}
                  />
                  {isOverBudget && (
                    <div className="text-xs text-red-500 font-medium">
                      Orçamento excedido em {(budget.spent - budget.amount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
            <p className="mb-4 text-muted-foreground">Você ainda não criou nenhum orçamento.</p>
            <Button 
              className="bg-finance-primary hover:bg-finance-primary/90"
              onClick={openBudgetDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro orçamento
            </Button>
          </div>
        )}
      </div>

      {/* Diálogo para criar/editar orçamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm 
            initialData={selectedBudget} 
            onClose={closeBudgetDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir orçamento */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BudgetsPage;
