-- =============================================
-- SISTEMA DE ORGANIZAÇÃO FINANCEIRA FAMILIAR
-- Estrutura completa do banco de dados
-- =============================================

-- 1. ENUM TYPES
-- =============================================

-- Roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'family_manager', 'family_member');

-- Status de convite de membro
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'rejected');

-- Grupos de despesas (obrigatório)
CREATE TYPE public.expense_group AS ENUM ('basic', 'financing', 'eventual');

-- Tipos de transação
CREATE TYPE public.transaction_type AS ENUM ('revenue', 'expense');

-- Tipos de recorrência
CREATE TYPE public.recurrence_type AS ENUM ('none', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom');

-- =============================================
-- 2. TABELAS PRINCIPAIS
-- =============================================

-- Famílias
CREATE TABLE public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Perfis de usuário (vinculado ao auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Roles de usuário (tabela separada para segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Permissões de membros da família
CREATE TABLE public.family_member_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    can_view_all_transactions BOOLEAN NOT NULL DEFAULT false,
    can_create_transactions BOOLEAN NOT NULL DEFAULT true,
    can_edit_own_transactions BOOLEAN NOT NULL DEFAULT true,
    can_delete_own_transactions BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, family_id)
);

-- Convites para família
CREATE TABLE public.family_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.invite_status NOT NULL DEFAULT 'pending',
    role public.app_role NOT NULL DEFAULT 'family_member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Categorias de transação (customizáveis por família)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type public.transaction_type NOT NULL,
    expense_group public.expense_group,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transações (receitas e despesas)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type public.transaction_type NOT NULL,
    expense_group public.expense_group,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    recurrence_type public.recurrence_type NOT NULL DEFAULT 'none',
    recurrence_interval INTEGER,
    recurrence_start_date DATE,
    recurrence_end_date DATE,
    recurrence_count INTEGER,
    parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    recurrence_index INTEGER,
    notify_on_due BOOLEAN NOT NULL DEFAULT false,
    notify_days_before INTEGER,
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurações globais do sistema (para Admin)
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Logs de auditoria
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 3. FUNÇÕES DE SEGURANÇA
-- =============================================

-- Função para verificar se usuário tem determinado role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se usuário pertence a uma família
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND family_id = _family_id
  )
$$;

-- Função para verificar se usuário é gestor da família
CREATE OR REPLACE FUNCTION public.is_family_manager(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE p.id = _user_id
      AND p.family_id = _family_id
      AND ur.role = 'family_manager'
  )
$$;

-- Função para obter permissões do membro
CREATE OR REPLACE FUNCTION public.get_member_permissions(_user_id UUID, _family_id UUID)
RETURNS public.family_member_permissions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.family_member_permissions
  WHERE user_id = _user_id
    AND family_id = _family_id
  LIMIT 1
$$;

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. RLS POLICIES
-- =============================================

-- FAMILIES
CREATE POLICY "Users can view their own family"
ON public.families FOR SELECT
TO authenticated
USING (
  id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Family managers can update their family"
ON public.families FOR UPDATE
TO authenticated
USING (
  public.is_family_manager(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can create families"
ON public.families FOR INSERT
TO authenticated
WITH CHECK (true);

-- PROFILES
CREATE POLICY "Users can view profiles in their family"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- USER ROLES
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their initial role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- FAMILY MEMBER PERMISSIONS
CREATE POLICY "Family managers can manage permissions"
ON public.family_member_permissions FOR ALL
TO authenticated
USING (
  public.is_family_manager(auth.uid(), family_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Members can view their own permissions"
ON public.family_member_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- FAMILY INVITES
CREATE POLICY "Family managers can manage invites"
ON public.family_invites FOR ALL
TO authenticated
USING (
  public.is_family_manager(auth.uid(), family_id)
);

CREATE POLICY "Users can view invites sent to their email"
ON public.family_invites FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- CATEGORIES
CREATE POLICY "Family members can view categories"
ON public.categories FOR SELECT
TO authenticated
USING (
  public.is_family_member(auth.uid(), family_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Family managers can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (
  public.is_family_manager(auth.uid(), family_id)
);

-- TRANSACTIONS
CREATE POLICY "Family members can view transactions based on permissions"
ON public.transactions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    public.is_family_member(auth.uid(), family_id)
    AND (
      public.is_family_manager(auth.uid(), family_id)
      OR (
        SELECT can_view_all_transactions 
        FROM public.family_member_permissions 
        WHERE user_id = auth.uid() AND family_id = transactions.family_id
      )
    )
  )
);

CREATE POLICY "Family members can create transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.is_family_member(auth.uid(), family_id)
);

CREATE POLICY "Users can update their own transactions or managers can update all"
ON public.transactions FOR UPDATE
TO authenticated
USING (
  (user_id = auth.uid())
  OR public.is_family_manager(auth.uid(), family_id)
);

CREATE POLICY "Users can delete their own transactions or managers can delete all"
ON public.transactions FOR DELETE
TO authenticated
USING (
  (user_id = auth.uid())
  OR public.is_family_manager(auth.uid(), family_id)
);

-- SYSTEM SETTINGS (Admin only)
CREATE POLICY "Only admins can manage system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- AUDIT LOGS
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Family managers can view their family's audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  public.is_family_manager(auth.uid(), family_id)
);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- 6. TRIGGERS
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers de updated_at
CREATE TRIGGER update_families_updated_at
BEFORE UPDATE ON public.families
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_member_permissions_updated_at
BEFORE UPDATE ON public.family_member_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_family_id ON public.profiles(family_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_transactions_family_id ON public.transactions(family_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_due_date ON public.transactions(due_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_expense_group ON public.transactions(expense_group);
CREATE INDEX idx_transactions_recurrence ON public.transactions(recurrence_type);
CREATE INDEX idx_categories_family_id ON public.categories(family_id);
CREATE INDEX idx_family_invites_email ON public.family_invites(email);
CREATE INDEX idx_audit_logs_family_id ON public.audit_logs(family_id);