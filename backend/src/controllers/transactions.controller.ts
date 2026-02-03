import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateTransaction } from '../types/index.js';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', req.userId)
            .order('date', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const transactionData: CreateTransaction = req.body;

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                ...transactionData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Erro ao deletar transação' });
    }
};
