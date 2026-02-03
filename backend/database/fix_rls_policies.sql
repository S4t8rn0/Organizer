-- Correção de Segurança - Política de UPDATE faltando em transactions
-- Execute este script no Supabase SQL Editor

-- Adicionar política de UPDATE para transactions (estava faltando)
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Nota: Se a política já existir, você receberá um erro.
-- Nesse caso, verifique se o RLS está funcionando corretamente.
