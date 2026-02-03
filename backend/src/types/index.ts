// TypeScript Types for Organizer Backend

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Trabalho' | 'Pessoal' | 'Estudo' | 'Saúde' | 'Espiritual' | 'Outro';
export type NoteCategory = 'Trabalho' | 'Pessoal' | 'Saúde' | 'Igreja' | 'Estudo' | 'Geral';
export type KanbanStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TransactionType = 'income' | 'expense';
export type FinanceCategory = 'Moradia' | 'Alimentação' | 'Transporte' | 'Lazer' | 'Salário' | 'Saúde' | 'Investimento' | 'Outro';
export type Recurrence = 'daily' | 'weekly';

// Database models (snake_case for PostgreSQL)
export interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    completed: boolean;
    date: string;
    priority: Priority;
    category: Category;
    folder_id?: string;
    recurrence?: Recurrence;
    created_at: string;
}

export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
    updated_at: string;
}

export interface CalendarEvent {
    id: string;
    user_id: string;
    title: string;
    start_time: string;
    end_time: string;
    description?: string;
    color: string;
    recurring: boolean;
    recurrence?: Recurrence;
}

export interface KanbanTask {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: KanbanStatus;
    priority: Priority;
    created_at: string;
}


export interface Transaction {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: FinanceCategory;
    date: string;
}

export interface FixedBill {
    id: string;
    user_id: string;
    title: string;
    amount: number;
    due_day: number;
    paid: boolean;
}

export interface Investment {
    id: string;
    user_id: string;
    name: string;
    type: string;
    current_value: number;
    yield_rate: number;
}

// Request types for creating/updating
export type CreateTask = Omit<Task, 'id' | 'user_id' | 'created_at'>;
export type CreateNote = Omit<Note, 'id' | 'user_id' | 'updated_at'>;
export type CreateCalendarEvent = Omit<CalendarEvent, 'id' | 'user_id'>;
export type CreateKanbanTask = Omit<KanbanTask, 'id' | 'user_id' | 'created_at'>;
export type CreateTransaction = Omit<Transaction, 'id' | 'user_id'>;
export type CreateFixedBill = Omit<FixedBill, 'id' | 'user_id'>;
export type CreateInvestment = Omit<Investment, 'id' | 'user_id'>;

// Express Request extension
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    userToken?: string;
}
