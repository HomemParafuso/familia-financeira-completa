
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { CreditCard } from 'lucide-react';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-muted/20 flex flex-col">
      <div className="container max-w-7xl flex flex-1 items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <CreditCard className="h-8 w-8 text-finance-primary" />
              <h1 className="text-2xl font-bold">Finanças Familiares</h1>
            </Link>
            <p className="mt-2 text-muted-foreground">
              Crie sua conta e comece a gerenciar suas finanças
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Finanças Familiares. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default RegisterPage;
