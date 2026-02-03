import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { Plus, Trash2, Tag, Calendar as CalendarIcon, Filter, CheckSquare, Square } from 'lucide-react';
import { CATEGORIES, PRIORITY_COLORS } from '../constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TasksProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, addTask, toggleTask, deleteTask }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Pessoal');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'pending' && task.completed) return false;
    if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
    return true;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      date: new Date()
    });
    setNewTaskTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sys-text-main dark:text-dark-text mb-2 tracking-tight">Minhas Tarefas</h1>
        <p className="text-sys-text-sec dark:text-sys-text-sub font-medium">Organize seu dia com calma e clareza.</p>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAddTask} className="bg-sys-card dark:bg-dark-card p-4 rounded-2xl shadow-soft border border-sys-border dark:border-dark-border mb-8 flex flex-col md:flex-row gap-4 transition-all focus-within:ring-1 ring-action-blue/50">
        <div className="flex-1">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Adicionar nova tarefa..."
            className="w-full h-full bg-transparent outline-none text-sys-text-main dark:text-dark-text placeholder-sys-text-sub"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
            className="bg-sys-bg dark:bg-dark-bg border-none rounded-lg text-sm p-2 text-sys-text-sec dark:text-sys-text-sub outline-none focus:ring-1 ring-action-blue"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value as Category)}
            className="bg-sys-bg dark:bg-dark-bg border-none rounded-lg text-sm p-2 text-sys-text-sec dark:text-sys-text-sub outline-none focus:ring-1 ring-action-blue"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button
            type="submit"
            className="bg-action-blue hover:bg-action-blue/90 text-white p-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex bg-sys-bg dark:bg-dark-card p-1 rounded-xl border border-sys-border dark:border-dark-border">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-sys-card dark:bg-dark-bg shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'pending' ? 'bg-sys-card dark:bg-dark-bg shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'completed' ? 'bg-sys-card dark:bg-dark-bg shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
          >
            Concluídas
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-sys-text-sub" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
            className="bg-transparent text-sm font-medium text-sys-text-sec dark:text-sys-text-sub outline-none cursor-pointer"
          >
            <option value="All">Todas Categorias</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-sys-text-sub bg-sys-bg/30 dark:bg-dark-bg/30 rounded-3xl border border-dashed border-sys-border dark:border-dark-border">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300
                ${task.completed
                  ? 'bg-sys-bg/50 dark:bg-dark-bg/50 border-transparent opacity-60'
                  : 'bg-sys-card dark:bg-dark-card border-sys-border dark:border-dark-border shadow-soft hover:border-action-blue/30'}`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`shrink-0 transition-colors ${task.completed ? 'text-action-blue' : 'text-sys-border dark:text-dark-border hover:text-action-blue'}`}
              >
                {task.completed ? <CheckSquare size={22} /> : <Square size={22} />}
              </button>

              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-sys-text-sub' : 'text-sys-text-main dark:text-dark-text'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-sys-text-sec dark:text-sys-text-sub font-medium">
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={12} />
                    {format(task.date, 'dd/MM/yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {task.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-sys-text-sub hover:text-calm-coral hover:bg-calm-coral/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;