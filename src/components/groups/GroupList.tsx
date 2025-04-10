
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/types/auth';
import { Users } from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  currentGroupId?: string;
  onSelectGroup: (group: Group) => void;
  onCreateGroup: () => void;
  onManageGroup: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  currentGroupId,
  onSelectGroup,
  onCreateGroup,
  onManageGroup
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Meus Grupos</h2>
        <Button 
          onClick={onCreateGroup}
          className="bg-finance-primary hover:bg-finance-primary/90"
        >
          Novo Grupo
        </Button>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhum grupo encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            Crie um grupo para compartilhar suas finanças com outras pessoas.
          </p>
          <Button 
            onClick={onCreateGroup} 
            className="mt-4 bg-finance-primary hover:bg-finance-primary/90"
          >
            Criar Grupo
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className={`finance-card cursor-pointer transition-all hover:shadow-lg ${
                group.id === currentGroupId ? 'ring-2 ring-finance-primary' : ''
              }`}
              onClick={() => onSelectGroup(group)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{group.name}</CardTitle>
                  <Badge variant={group.ownerId === 'u1' ? 'default' : 'secondary'}>
                    {group.ownerId === 'u1' ? 'Proprietário' : 'Membro'}
                  </Badge>
                </div>
                <CardDescription>
                  {group.description || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {group.members.length} membros
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Criado em {format(new Date(group.createdAt), 'P', { locale: ptBR })}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageGroup(group);
                  }}
                >
                  Gerenciar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;
