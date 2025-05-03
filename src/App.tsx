
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import { GroupProvider } from "./contexts/GroupContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import GroupsPage from "./pages/GroupsPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

// Auth protection HOC
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <FinanceProvider>
              <GroupProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/transactions" element={
                    <ProtectedRoute>
                      <TransactionsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/budgets" element={
                    <ProtectedRoute>
                      <BudgetsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/categories" element={
                    <ProtectedRoute>
                      <CategoriesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/groups" element={
                    <ProtectedRoute>
                      <GroupsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </GroupProvider>
            </FinanceProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
