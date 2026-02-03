import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateInvestment } from '../types/index.js';

export const getInvestments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', req.userId)
            .order('name', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ error: 'Erro ao buscar investimentos' });
    }
};

export const createInvestment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const investmentData: CreateInvestment = req.body;

        const { data, error } = await supabase
            .from('investments')
            .insert({
                ...investmentData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating investment:', error);
        res.status(500).json({ error: 'Erro ao criar investimento' });
    }
};

export const updateInvestment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('investments')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            res.status(404).json({ error: 'Investimento não encontrado' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating investment:', error);
        res.status(500).json({ error: 'Erro ao atualizar investimento' });
    }
};

export const deleteInvestment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('investments')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({ error: 'Erro ao deletar investimento' });
    }
};
