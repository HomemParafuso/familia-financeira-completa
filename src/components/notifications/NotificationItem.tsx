
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  date: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const { id, type, title, message, read, date } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div 
      className={cn(
        "p-4 border-b transition-colors duration-200",
        read ? "bg-background" : "bg-muted"
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium">{title}</h4>
            <span className="text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          
          <div className="mt-2 flex justify-end space-x-2">
            {!read && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs py-1 h-7"
                onClick={() => onMarkAsRead(id)}
              >
                Marcar como lido
              </Button>
            )}
            <Button 
              size="sm"
              variant="ghost"
              className="text-xs py-1 h-7"
              onClick={() => onDelete(id)}
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
