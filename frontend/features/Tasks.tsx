import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { Plus, Trash2, Tag, Calendar as CalendarIcon, Filter, CheckSquare, Square, Pencil, X, RefreshCw } from 'lucide-react';
import { CATEGORIES, PRIORITY_COLORS } from '../constants';
import { format, getDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAYS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

interface TasksProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  toggleTask: (id: string, date?: string) => void;
  deleteTask: (id: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, addTask, updateTask, toggleTask, deleteTask }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Pessoal');
  const [newTaskRecurrence, setNewTaskRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [newTaskWeekdays, setNewTaskWeekdays] = useState<number[]>([getDay(new Date())]);

  // Edit modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCategory, setEditCategory] = useState<Category>('Pessoal');
  const [editRecurrence, setEditRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [editWeekdays, setEditWeekdays] = useState<number[]>([1]);

  const filteredTasks = tasks
    .filter(task => {
      const dateStr = format(task.date, 'yyyy-MM-dd');
      const isCompleted = task.recurrence
        ? (task.completedDates || []).includes(dateStr)
        : task.completed;

      if (filter === 'completed' && !isCompleted) return false;
      if (filter === 'pending' && isCompleted) return false;
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const toggleNewTaskWeekday = (day: number) => {
    setNewTaskWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (newTaskRecurrence === 'weekly' && newTaskWeekdays.length > 0) {
      newTaskWeekdays.forEach(weekday => {
        addTask({
          title: newTaskTitle,
          priority: newTaskPriority,
          category: newTaskCategory,
          completed: false,
          date: getDateForWeekday(weekday, new Date()),
          recurrence: 'weekly',
        });
      });
    } else {
      addTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        category: newTaskCategory,
        completed: false,
        date: new Date(),
        recurrence: newTaskRecurrence === 'none' ? undefined : newTaskRecurrence,
      });
    }
    setNewTaskTitle('');
    setNewTaskRecurrence('none');
    setNewTaskWeekdays([getDay(new Date())]);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditRecurrence(task.recurrence || 'none');
    setEditWeekdays([getDay(task.date)]);
  };

  const getDateForWeekday = (weekday: number, refDate: Date): Date => {
    const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
    // Map weekday (0=Sun) to offset from Monday start
    const offset = weekday === 0 ? 6 : weekday - 1;
    return addDays(weekStart, offset);
  };

  const toggleEditWeekday = (day: number) => {
    setEditWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const updates: Partial<Task> = {
      title: editTitle,
      priority: editPriority,
      category: editCategory,
      recurrence: editRecurrence === 'none' ? undefined : editRecurrence,
    };

    if (editRecurrence === 'weekly' && editWeekdays.length > 0) {
      // Update existing task with the first selected day
      updates.date = getDateForWeekday(editWeekdays[0], editingTask.date);
      updateTask(editingTask.id, updates);

      // Create new tasks for each additional selected day
      editWeekdays.slice(1).forEach(weekday => {
        addTask({
          title: editTitle,
          priority: editPriority,
          category: editCategory,
          completed: false,
          date: getDateForWeekday(weekday, editingTask.date),
          recurrence: 'weekly',
        });
      });
    } else {
      updateTask(editingTask.id, updates);
    }

    setEditingTask(null);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-5 md:mb-7">
        <h1 className="text-xl md:text-2xl font-bold text-sys-text-main dark:text-dark-text mb-1 md:mb-2 tracking-tight">Minhas Tarefas</h1>
        <p className="text-sm text-sys-text-sec dark:text-sys-text-sub font-medium">Organize seu dia com calma e clareza.</p>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAddTask} className="bg-sys-card dark:bg-dark-card p-3 md:p-4 rounded-2xl shadow-soft border border-sys-border dark:border-dark-border mb-3 md:mb-8 flex flex-col gap-3 md:gap-4 transition-all focus-within:ring-1 ring-action-blue/50">
        <div className="flex flex-col md:flex-row gap-4">
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
        </div>

        {/* Recurrence selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sys-text-sec dark:text-sys-text-sub uppercase tracking-wide">
            <RefreshCw size={12} />
            Repetição
          </div>
          <div className="flex bg-sys-bg dark:bg-dark-bg rounded-xl p-1 border border-sys-border dark:border-dark-border">
            <button
              type="button"
              onClick={() => setNewTaskRecurrence('none')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${newTaskRecurrence === 'none' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-sys-text-main dark:text-dark-text' : 'text-sys-text-sub'}`}
            >
              Não
            </button>
            <button
              type="button"
              onClick={() => setNewTaskRecurrence('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${newTaskRecurrence === 'daily' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
            >
              Diária
            </button>
            <button
              type="button"
              onClick={() => setNewTaskRecurrence('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${newTaskRecurrence === 'weekly' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
            >
              Semanal
            </button>
          </div>
        </div>

        {/* Weekday picker */}
        {newTaskRecurrence === 'weekly' && (
          <div>
            <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">Repetir toda</label>
            <div className="flex gap-1.5">
              {WEEKDAYS.map(wd => (
                <button
                  key={wd.value}
                  type="button"
                  onClick={() => toggleNewTaskWeekday(wd.value)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newTaskWeekdays.includes(wd.value)
                    ? 'bg-action-blue text-white shadow-sm'
                    : 'bg-sys-bg dark:bg-dark-bg text-sys-text-sub hover:text-action-blue'
                    }`}
                >
                  {wd.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between mb-3 md:mb-6 gap-3 md:gap-4">
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
      <div className="space-y-3 md:space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-sys-text-sub bg-sys-bg/30 dark:bg-dark-bg/30 rounded-3xl border border-dashed border-sys-border dark:border-dark-border">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          filteredTasks.map(task => {
            const dateStr = format(task.date, 'yyyy-MM-dd');
            const isCompleted = task.recurrence
              ? (task.completedDates || []).includes(dateStr)
              : task.completed;

            return (
              <div
                key={task.id}
                className={`group flex items-center gap-3 md:gap-4 p-3 md:p-5 rounded-2xl border transition-all duration-300
                ${isCompleted
                    ? 'bg-sys-bg/50 dark:bg-dark-bg/50 border-transparent opacity-60'
                    : 'bg-sys-card dark:bg-dark-card border-sys-border dark:border-dark-border shadow-soft hover:border-action-blue/30'}`}
              >
                <button
                  onClick={() => task.recurrence ? toggleTask(task.id, dateStr) : toggleTask(task.id)}
                  className={`shrink-0 transition-colors ${isCompleted ? 'text-action-blue' : 'text-sys-border dark:text-dark-border hover:text-action-blue'}`}
                >
                  {isCompleted ? <CheckSquare size={22} /> : <Square size={22} />}
                </button>

                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${isCompleted ? 'line-through text-sys-text-sub' : 'text-sys-text-main dark:text-dark-text'}`}>
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
                    onClick={() => openEditModal(task)}
                    className="p-2 text-sys-text-sub hover:text-action-blue hover:bg-action-blue/10 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-sys-text-sub hover:text-calm-coral hover:bg-calm-coral/10 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-sys-text-main/10 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sys-card dark:bg-dark-card rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in border border-sys-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-sys-text-main dark:text-dark-text">Editar Tarefa</h3>
              <button onClick={() => setEditingTask(null)} className="text-sys-text-sub hover:text-sys-text-main dark:hover:text-dark-text">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Título</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none focus:ring-1 ring-action-blue dark:text-dark-text border border-transparent transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Prioridade</label>
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as Priority)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text border-r-[12px] border-r-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Categoria</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as Category)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text border-r-[12px] border-r-transparent"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Repetição</label>
                <div className="flex bg-sys-bg dark:bg-dark-bg rounded-xl p-1 border border-sys-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setEditRecurrence('none')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${editRecurrence === 'none' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-sys-text-main dark:text-dark-text' : 'text-sys-text-sub'}`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRecurrence('daily')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${editRecurrence === 'daily' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
                  >
                    Diária
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRecurrence('weekly')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${editRecurrence === 'weekly' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
                  >
                    Semanal
                  </button>
                </div>
              </div>
              {editRecurrence === 'weekly' && (
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">Repetir toda</label>
                  <div className="flex gap-1.5">
                    {WEEKDAYS.map(wd => (
                      <button
                        key={wd.value}
                        type="button"
                        onClick={() => toggleEditWeekday(wd.value)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editWeekdays.includes(wd.value)
                          ? 'bg-action-blue text-white shadow-sm'
                          : 'bg-sys-bg dark:bg-dark-bg text-sys-text-sub hover:text-action-blue'
                          }`}
                      >
                        {wd.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <button type="submit" className="w-full bg-action-blue hover:bg-action-blue/90 text-white font-semibold py-3 rounded-xl transition-colors">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;