import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateNote } from '../types/index.js';

export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', req.userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Erro ao buscar notas' });
    }
};

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const noteData: CreateNote = req.body;

        const { data, error } = await supabase
            .from('notes')
            .insert({
                ...noteData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('notes')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            res.status(404).json({ error: 'Nota não encontrada' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Erro ao atualizar nota' });
    }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Erro ao deletar nota' });
    }
};
