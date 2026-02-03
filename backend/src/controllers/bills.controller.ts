import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateFixedBill } from '../types/index.js';

export const getBills = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('fixed_bills')
            .select('*')
            .eq('user_id', req.userId)
            .order('due_day', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ error: 'Erro ao buscar contas fixas' });
    }
};

export const createBill = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const billData: CreateFixedBill = req.body;

        const { data, error } = await supabase
            .from('fixed_bills')
            .insert({
                ...billData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ error: 'Erro ao criar conta fixa' });
    }
};

export const updateBill = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('fixed_bills')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            res.status(404).json({ error: 'Conta fixa não encontrada' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({ error: 'Erro ao atualizar conta fixa' });
    }
};

export const toggleBill = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        // First get current state
        const { data: bill, error: fetchError } = await supabase
            .from('fixed_bills')
            .select('paid')
            .eq('id', id)
            .eq('user_id', req.userId)
            .single();

        if (fetchError || !bill) {
            res.status(404).json({ error: 'Conta fixa não encontrada' });
            return;
        }

        // Toggle
        const { data, error } = await supabase
            .from('fixed_bills')
            .update({ paid: !bill.paid })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error toggling bill:', error);
        res.status(500).json({ error: 'Erro ao alternar status da conta' });
    }
};

export const deleteBill = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('fixed_bills')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({ error: 'Erro ao deletar conta fixa' });
    }
};
