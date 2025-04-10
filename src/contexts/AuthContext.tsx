
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from '@/types/auth';
import { mockUsers } from '@/mockData';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved user in localStorage (simulating persistence)
    const savedUser = localStorage.getItem('finanças-familiares-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login functionality
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email (in a real app, this would validate the password too)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }

      // Set the user in state and localStorage
      setUser(foundUser);
      localStorage.setItem('finanças-familiares-user', JSON.stringify(foundUser));
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Falha ao realizar login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register functionality
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email já cadastrado');
      }

      // Create new user (in a real app, this would hash the password and save to DB)
      const newUser: User = {
        id: `u${Date.now()}`,
        name,
        email,
        role: 'member', // Default role for new users
        createdAt: new Date().toISOString(),
      };

      // Set the user in state and localStorage
      setUser(newUser);
      localStorage.setItem('finanças-familiares-user', JSON.stringify(newUser));
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Falha ao realizar cadastro');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality
  const logout = () => {
    localStorage.removeItem('finanças-familiares-user');
    setUser(null);
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
