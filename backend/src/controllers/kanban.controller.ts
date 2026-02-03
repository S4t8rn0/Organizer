import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateKanbanTask } from '../types/index.js';

export const getKanbanTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('kanban_tasks')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching kanban tasks:', error);
        res.status(500).json({ error: 'Erro ao buscar tarefas do kanban' });
    }
};

export const createKanbanTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const taskData: CreateKanbanTask = req.body;

        const { data, error } = await supabase
            .from('kanban_tasks')
            .insert({
                ...taskData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating kanban task:', error);
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
};

export const updateKanbanTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('kanban_tasks')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            res.status(404).json({ error: 'Tarefa não encontrada' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating kanban task:', error);
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
};

export const deleteKanbanTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('kanban_tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting kanban task:', error);
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
};
