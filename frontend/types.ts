export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Trabalho' | 'Pessoal' | 'Estudo' | 'Saúde' | 'Espiritual' | 'Outro';
export type NoteCategory = 'Trabalho' | 'Pessoal' | 'Saúde' | 'Igreja' | 'Estudo' | 'Geral';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: Date;
  priority: Priority;
  category: Category;
  folderId?: string;
  recurrence?: 'daily' | 'weekly';
  completedDates?: string[];
  deletedDates?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  category: NoteCategory;
  tags: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color: string;
  recurring?: boolean;
  recurrence?: 'daily' | 'weekly';
}

// Kanban Types
export type KanbanStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  priority: Priority;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
}

// Finance Types
export type TransactionType = 'income' | 'expense';
export type FinanceCategory = 'Moradia' | 'Alimentação' | 'Transporte' | 'Lazer' | 'Salário' | 'Saúde' | 'Investimento' | 'Outro';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: FinanceCategory;
  date: Date;
}

export interface FixedBill {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  paid: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: string; // ex: Renda Fixa, Ações
  currentValue: number;
  yieldRate: number; // Porcentagem ou valor absoluto de rendimento recente
}

export type ViewState = 'dashboard' | 'planner' | 'tasks' | 'notes' | 'kanban' | 'finance';
