
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Notification, NotificationType } from '@/components/notifications/NotificationItem';

// Notificações de exemplo
const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'info',
    title: 'Bem-vindo ao Sistema',
    message: 'Olá! Bem-vindo ao sistema de Finanças Familiares.',
    read: false,
    date: new Date().toISOString()
  },
  {
    id: 'n2',
    type: 'success',
    title: 'Transação adicionada',
    message: 'Sua última transação foi adicionada com sucesso.',
    read: false,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'n3',
    type: 'warning',
    title: 'Limite de orçamento',
    message: 'Você está próximo de atingir o limite do orçamento em "Alimentação".',
    read: true,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

interface NotificationContextType {
  notifications: Notification[];
  hasUnread: boolean;
  addNotification: (type: NotificationType, title: string, message: string) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [hasUnread, setHasUnread] = useState(false);

  // Verificar se há notificações não lidas
  useEffect(() => {
    const unreadExists = notifications.some(notification => !notification.read);
    setHasUnread(unreadExists);
  }, [notifications]);

  // Adicionar nova notificação
  const addNotification = (type: NotificationType, title: string, message: string) => {
    const newNotification: Notification = {
      id: `n${Date.now()}`,
      type,
      title,
      message,
      read: false,
      date: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Excluir uma notificação
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Limpar todas as notificações
  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnread,
        addNotification,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
