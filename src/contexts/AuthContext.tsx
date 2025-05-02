
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { mockUsers } from '@/mockData';
import { toast } from 'sonner';

// Define the system administrator email
const SYSTEM_ADMIN_EMAIL = "pabllo.tca@gmail.com";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved user in localStorage (simulating persistence)
    const savedUser = localStorage.getItem('finanças-familiares-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      // Assign the proper role based on email
      if (parsedUser) {
        if (parsedUser.email === SYSTEM_ADMIN_EMAIL) {
          parsedUser.role = 'admin' as UserRole;
        } else {
          parsedUser.role = 'member' as UserRole;
        }
      }
      
      setUser(parsedUser);
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

      // Set the proper role based on email
      const userWithRole: User = { 
        ...foundUser, 
        role: email === SYSTEM_ADMIN_EMAIL ? 'admin' as UserRole : 'member' as UserRole
      };

      console.log(`User logged in: ${email} with role: ${userWithRole.role}`);

      // Set the user in state and localStorage
      setUser(userWithRole);
      localStorage.setItem('finanças-familiares-user', JSON.stringify(userWithRole));
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

      // Create new user with proper role based on email
      const newUser: User = {
        id: `u${Date.now()}`,
        name,
        email,
        role: email === SYSTEM_ADMIN_EMAIL ? 'admin' as UserRole : 'member' as UserRole,
        createdAt: new Date().toISOString(),
      };

      console.log(`User registered: ${email} with role: ${newUser.role}`);

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
