import { Category, Priority, FinanceCategory, NoteCategory } from './types';

export const NOTE_CATEGORY_COLORS: Record<NoteCategory, string> = {
  'Trabalho': 'text-action-blue',
  'Pessoal': 'text-calm-coral',
  'Saúde': 'text-terracotta',
  'Igreja': 'text-soft-lilac',
  'Estudo': 'text-org-blue',
  'Geral': 'text-sys-text-sub'
};

export const NOTE_CATEGORIES = ['Trabalho', 'Pessoal', 'Saúde', 'Igreja', 'Estudo', 'Geral'] as const;


export const CATEGORIES: Category[] = ['Trabalho', 'Pessoal', 'Estudo', 'Saúde', 'Espiritual', 'Outro'];

export const FINANCE_CATEGORIES: FinanceCategory[] = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Salário', 'Saúde', 'Investimento', 'Outro'];

export const PRIORITY_COLORS: Record<Priority, string> = {
  // Low -> Action Blue (Teal)
  low: 'bg-action-blue/10 text-action-blue border border-action-blue/20',
  // Medium -> Soft Lilac (Purple)
  medium: 'bg-soft-lilac/10 text-soft-lilac border border-soft-lilac/20',
  // High -> Terracotta (Orange)
  high: 'bg-terracotta/10 text-terracotta border border-terracotta/20',
};

export const QUOTES = [
  "A organização traz calma para a mente.",
  "Um passo de cada vez, com propósito.",
  "Simplifique seu dia para ampliar seu foco.",
  "Sua mente deve ser um lago sereno, não uma tempestade.",
  "O equilíbrio é a chave da produtividade sustentável.",
  "Cuide do seu tempo como cuida de si mesmo.",
];

export const MOCK_FOLDERS = [
  { id: '1', name: 'Projetos 2024', icon: 'folder' },
  { id: '2', name: 'Inspirações', icon: 'lightbulb' },
  { id: '3', name: 'Finanças', icon: 'dollar-sign' },
];

