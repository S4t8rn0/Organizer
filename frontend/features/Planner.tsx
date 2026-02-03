import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, getDay, addWeeks, subWeeks, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Calendar as CalendarIcon, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { CalendarEvent, Task, Priority } from '../types';
import { PRIORITY_COLORS } from '../constants';

interface PlannerProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const Planner: React.FC<PlannerProps> = ({
  events,
  tasks,
  onAddEvent,
  onDeleteEvent,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // New Event State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTimeStart, setNewEventTimeStart] = useState('09:00');
  const [newEventTimeEnd, setNewEventTimeEnd] = useState('10:00');
  const [newEventColor, setNewEventColor] = useState('bg-action-blue');
  const [newEventRecurrence, setNewEventRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');

  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskRecurrence, setNewTaskRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');

  // Hover state for zoom/blur effect
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const handleOpenEventModal = (date: Date) => {
    setSelectedDate(date);
    setNewEventTitle('');
    setNewEventRecurrence('none');
    setIsEventModalOpen(true);
  };

  const handleOpenTaskModal = (date: Date) => {
    setSelectedDate(date);
    setNewTaskTitle('');
    setNewTaskRecurrence('none');
    setIsTaskModalOpen(true);
  };

  const submitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    const [startHours, startMinutes] = newEventTimeStart.split(':').map(Number);
    const [endHours, endMinutes] = newEventTimeEnd.split(':').map(Number);

    const start = new Date(selectedDate);
    start.setHours(startHours, startMinutes);

    const end = new Date(selectedDate);
    end.setHours(endHours, endMinutes);

    onAddEvent({
      title: newEventTitle,
      start,
      end,
      color: newEventColor,
      recurrence: newEventRecurrence === 'none' ? undefined : newEventRecurrence,
      recurring: newEventRecurrence !== 'none'
    });
    setIsEventModalOpen(false);
  };

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    onAddTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      date: selectedDate,
      category: 'Outro', // Default category for quick add
      completed: false,
      recurrence: newTaskRecurrence === 'none' ? undefined : newTaskRecurrence,
    });
    setIsTaskModalOpen(false);
  };

  const COLORS = [
    { value: 'bg-action-blue', label: 'Azul' },
    { value: 'bg-org-blue', label: 'Azul Cinza' },
    { value: 'bg-terracotta', label: 'Terracota' },
    { value: 'bg-calm-coral', label: 'Coral' },
    { value: 'bg-soft-lilac', label: 'Lilás' },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-[3000px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 px-7">
        <div>
          <h2 className="text-2xl font-bold text-sys-text-main dark:text-dark-text capitalize tracking-tight">
            {format(currentWeekStart, "'Semana de' d 'de' MMMM", { locale: ptBR })}
          </h2>
          <div className="h-1 w-20 bg-org-blue mt-2 rounded-full opacity-50"></div>
        </div>
        <div className="flex items-center gap-2 bg-sys-card dark:bg-dark-card p-1.5 rounded-xl shadow-sm border border-sys-border dark:border-dark-border">
          <button
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            className="p-2 hover:bg-sys-bg dark:hover:bg-dark-bg rounded-lg transition-colors text-sys-text-sec dark:text-sys-text-sub"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-4 py-1.5 text-sm font-semibold text-sys-text-main dark:text-dark-text bg-sys-bg dark:bg-dark-bg rounded-lg hover:bg-sys-border dark:hover:bg-dark-border transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            className="p-2 hover:bg-sys-bg dark:hover:bg-dark-bg rounded-lg transition-colors text-sys-text-sec dark:text-sys-text-sub"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-visible pb-4 pt-4 px-7">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 min-w-[2800px] md:min-w-0 h-full">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());

            // Filter Events for this day (handling recurring)
            const dayEvents = events.filter(event => {
              if (event.recurrence === 'daily') return true;
              if (event.recurrence === 'weekly' || event.recurring) {
                return getDay(event.start) === getDay(day);
              }
              return isSameDay(event.start, day);
            }).sort((a, b) => a.start.getHours() - b.start.getHours());

            // Filter Tasks for this day
            const dayTasks = tasks.filter(task => {
              if (task.recurrence === 'daily') return true;
              if (task.recurrence === 'weekly') return getDay(task.date) === getDay(day);
              return isSameDay(task.date, day);
            });

            return (
              <div
                key={day.toString()}
                onMouseEnter={() => setHoveredDay(day.toString())}
                onMouseLeave={() => setHoveredDay(null)}
                className={`flex flex-col bg-sys-card dark:bg-dark-card rounded-2xl border h-full max-h-full overflow-hidden
                  transition-all duration-300 ease-out origin-center
                  ${hoveredDay === day.toString()
                    ? 'scale-[1.02] -mx-6 shadow-2xl z-20'
                    : hoveredDay !== null
                      ? 'blur-[1px] opacity-60 scale-[0.98]'
                      : ''}
                  ${isToday
                    ? 'border-org-blue ring-1 ring-org-blue ring-opacity-30'
                    : 'border-sys-border dark:border-dark-border'}`}
              >
                {/* Column Header */}
                <div className={`p-4 text-center border-b ${isToday ? 'bg-org-blue/5 dark:bg-org-blue/10' : 'border-sys-border dark:border-dark-border'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-action-blue dark:text-action-blue' : 'text-sys-text-sub'}`}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <p className={`text-xl font-bold ${isToday ? 'text-action-blue dark:text-white' : 'text-sys-text-main dark:text-dark-text'}`}>
                    {format(day, 'dd')}
                  </p>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">

                  {/* Events Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[10px] font-bold text-sys-text-sub uppercase tracking-wider">Eventos</span>
                      <button
                        onClick={() => handleOpenEventModal(day)}
                        className="text-sys-text-sub hover:text-action-blue transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {dayEvents.length === 0 && (
                      <div className="text-center py-4 bg-sys-bg/30 dark:bg-dark-bg/30 rounded-lg">
                        <p className="text-[10px] text-sys-text-sub">Livre</p>
                      </div>
                    )}

                    {dayEvents.map(evt => (
                      <div key={evt.id} className="p-2 min-h-[64px] flex flex-col justify-center rounded-xl bg-sys-bg dark:bg-dark-bg hover:shadow-sm transition-all group relative overflow-hidden border border-transparent hover:border-sys-border dark:hover:border-dark-border">
                        <div className={`absolute top-0 left-0 w-1 h-full ${evt.color} rounded-l-xl`}></div>
                        <div className="pl-2">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-semibold text-sys-text-main dark:text-dark-text truncate">{evt.title}</p>

                          </div>
                          <p className="text-[10px] text-sys-text-sec dark:text-sys-text-sub flex items-center gap-1 mt-1 font-medium">
                            <Clock size={10} />
                            {format(evt.start, 'HH:mm')} - {format(evt.end, 'HH:mm')}
                          </p>
                        </div>
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-sys-text-sub hover:text-calm-coral transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Tasks Section */}
                  <div className="space-y-2 pt-2 border-t border-sys-border dark:border-dark-border">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[10px] font-bold text-sys-text-sub uppercase tracking-wider">Tarefas</span>
                      <button
                        onClick={() => handleOpenTaskModal(day)}
                        className="text-sys-text-sub hover:text-terracotta transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {dayTasks.map(task => (
                      <div key={task.id} className="group flex items-start gap-1.5 p-1.5 bg-sys-bg/40 dark:bg-dark-bg/40 border border-transparent rounded-lg hover:bg-sys-bg hover:border-sys-border transition-colors">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`mt-0.5 shrink-0 transition-colors ${task.completed ? 'text-action-blue' : 'text-sys-border dark:text-dark-border hover:text-action-blue'}`}
                        >
                          {task.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs break-words ${task.completed ? 'line-through text-sys-text-sub' : 'text-sys-text-main dark:text-dark-text font-medium'}`}>
                            {task.title}
                          </p>
                          <div className={`inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wide ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-sys-text-sub hover:text-calm-coral transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => handleOpenTaskModal(day)}
                      className="w-full py-2 border border-dashed border-sys-border dark:border-dark-border rounded-lg text-[10px] text-sys-text-sub hover:text-terracotta hover:border-terracotta hover:bg-terracotta/5 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus size={10} /> Adicionar
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-sys-text-main/10 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sys-card dark:bg-dark-card rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in border border-sys-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-sys-text-main dark:text-dark-text">Novo Compromisso</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-sys-text-sub hover:text-sys-text-main dark:hover:text-dark-text">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Título</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none focus:ring-1 ring-action-blue dark:text-dark-text border border-transparent transition-all"
                  placeholder="Ex: Reunião"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Início</label>
                  <input
                    type="time"
                    required
                    value={newEventTimeStart}
                    onChange={e => setNewEventTimeStart(e.target.value)}
                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Fim</label>
                  <input
                    type="time"
                    required
                    value={newEventTimeEnd}
                    onChange={e => setNewEventTimeEnd(e.target.value)}
                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">Cor</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewEventColor(c.value)}
                      className={`w-8 h-8 rounded-full ${c.value} transition-transform ${newEventColor === c.value ? 'ring-2 ring-offset-2 ring-sys-border scale-110' : 'hover:scale-110'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Repetição</label>
                <div className="flex bg-sys-bg dark:bg-dark-bg rounded-xl p-1 border border-sys-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setNewEventRecurrence('none')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${newEventRecurrence === 'none' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-sys-text-main dark:text-dark-text' : 'text-sys-text-sub'}`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEventRecurrence('daily')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${newEventRecurrence === 'daily' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
                  >
                    Diária
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEventRecurrence('weekly')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${newEventRecurrence === 'weekly' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-action-blue' : 'text-sys-text-sub'}`}
                  >
                    Semanal
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-sys-text-sub mb-4 flex items-center gap-1">
                  <CalendarIcon size={12} />
                  {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                </p>
                <button type="submit" className="w-full bg-action-blue hover:bg-action-blue/90 text-white font-semibold py-3 rounded-xl transition-colors">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-sys-text-main/10 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sys-card dark:bg-dark-card rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in border border-sys-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-sys-text-main dark:text-dark-text">Nova Tarefa</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-sys-text-sub hover:text-sys-text-main dark:hover:text-dark-text">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Descrição</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none focus:ring-1 ring-terracotta dark:text-dark-text border border-transparent transition-all"
                  placeholder="Ex: Enviar relatório"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Prioridade</label>
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as Priority)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text border-r-[12px] border-r-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Repetição</label>
                <div className="flex bg-sys-bg dark:bg-dark-bg rounded-xl p-1 border border-sys-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setNewTaskRecurrence('none')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${newTaskRecurrence === 'none' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-sys-text-main dark:text-dark-text' : 'text-sys-text-sub'}`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskRecurrence('daily')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${newTaskRecurrence === 'daily' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-terracotta' : 'text-sys-text-sub'}`}
                  >
                    Diária
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskRecurrence('weekly')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${newTaskRecurrence === 'weekly' ? 'bg-sys-card dark:bg-dark-card shadow-sm text-terracotta' : 'text-sys-text-sub'}`}
                  >
                    Semanal
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-sys-text-sub mb-4 flex items-center gap-1">
                  <CalendarIcon size={12} />
                  {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                </p>
                <button type="submit" className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold py-3 rounded-xl transition-colors">
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;