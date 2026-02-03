import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { AuthenticatedRequest, CreateCalendarEvent } from '../types/index.js';

export const getEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', req.userId)
            .order('start_time', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
};

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const eventData: CreateCalendarEvent = req.body;

        const { data, error } = await supabase
            .from('calendar_events')
            .insert({
                ...eventData,
                user_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
};

export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('calendar_events')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            res.status(404).json({ error: 'Evento não encontrado' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
};

export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabase = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
};
