import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateTask } from '../types/index.js';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', req.userId)
            .order('date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const taskData: CreateTask = req.body;

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                ...taskData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('tasks')
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
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
};

export const toggleTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        // First get current state
        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('completed')
            .eq('id', id)
            .eq('user_id', req.userId)
            .single();

        if (fetchError || !task) {
            res.status(404).json({ error: 'Tarefa não encontrada' });
            return;
        }

        // Toggle
        const { data, error } = await supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ error: 'Erro ao alternar tarefa' });
    }
};

export const hideTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const { date } = req.body;

        if (!date) {
            res.status(400).json({ error: 'Data é obrigatória' });
            return;
        }

        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('deleted_dates, recurrence')
            .eq('id', id)
            .eq('user_id', req.userId)
            .single();

        if (fetchError || !task) {
            res.status(404).json({ error: 'Tarefa não encontrada' });
            return;
        }

        const deletedDates: string[] = task.deleted_dates || [];
        const updatedDates = deletedDates.includes(date)
            ? deletedDates
            : [...deletedDates, date];

        const { data, error } = await supabase
            .from('tasks')
            .update({ deleted_dates: updatedDates })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error hiding task:', error);
        res.status(500).json({ error: 'Erro ao ocultar tarefa' });
    }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
};
