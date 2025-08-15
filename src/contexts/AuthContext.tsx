
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { mockUsers } from '@/mockData';
import { toast } from 'sonner';

// Define the system administrator credentials
const SYSTEM_ADMIN_EMAIL = "pabllo.tca@gmail.com";
const SYSTEM_ADMIN_PASSWORD = "admin123";

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
      
      // Assign the proper role based on email and existing role
      if (parsedUser) {
        if (parsedUser.email === SYSTEM_ADMIN_EMAIL) {
          parsedUser.role = 'admin' as UserRole;
        } else if (!parsedUser.role) {
          parsedUser.role = 'member' as UserRole;
        }
        // If role already exists (manager/member), keep it
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
      
      // Check if it's the system admin
      if (email === SYSTEM_ADMIN_EMAIL) {
        if (password !== SYSTEM_ADMIN_PASSWORD) {
          throw new Error('Credenciais inválidas');
        }
        
        const adminUser: User = {
          id: 'admin-system',
          name: 'Administrador do Sistema',
          email: SYSTEM_ADMIN_EMAIL,
          role: 'admin' as UserRole,
          createdAt: new Date().toISOString(),
        };

        setUser(adminUser);
        localStorage.setItem('finanças-familiares-user', JSON.stringify(adminUser));
        toast.success('Login de administrador realizado com sucesso!');
        navigate('/admin');
        return;
      }
      
      // Find user with matching email (in a real app, this would validate the password too)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }

      // Set the proper role based on user type (manager or member)
      const userWithRole: User = { 
        ...foundUser, 
        role: foundUser.role || 'member' as UserRole
      };

      console.log(`User logged in: ${email} with role: ${userWithRole.role}`);

      // Set the user in state and localStorage
      setUser(userWithRole);
      localStorage.setItem('finanças-familiares-user', JSON.stringify(userWithRole));
      toast.success('Login realizado com sucesso!');
      
      // Navigate based on role
      if (userWithRole.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/dashboard');
      }
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
        role: email === SYSTEM_ADMIN_EMAIL ? 'admin' as UserRole : 'manager' as UserRole,
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
