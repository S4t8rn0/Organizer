import React, { useState } from 'react';
import { Task, CalendarEvent, KanbanTask, Note } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, Plus, Zap, ArrowRight, Columns, FileText, Tag } from 'lucide-react';
import { QUOTES, PRIORITY_COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  tasks: Task[];
  events: CalendarEvent[];
  kanbanTasks: KanbanTask[];
  notes: Note[];
  onToggleTask: (id: string, date?: string) => void;
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, events, kanbanTasks, notes, onToggleTask, onNavigate }) => {
  const { user } = useAuth();

  // Get user's display name
  const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';

  // Filter for today's tasks
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todaysTasks = tasks.filter(t =>
    new Date(t.date).toDateString() === today.toDateString()
  );

  const isTaskCompletedToday = (task: Task) => {
    if (task.recurrence) {
      return (task.completedDates || []).includes(todayStr);
    }
    return task.completed;
  };

  const pendingTasks = todaysTasks.filter(t => !isTaskCompletedToday(t));
  const completedTasks = todaysTasks.filter(t => isTaskCompletedToday(t));
  const progress = todaysTasks.length > 0 ? (completedTasks.length / todaysTasks.length) * 100 : 0;

  const quote = QUOTES[today.getDate() % QUOTES.length];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-sys-text-main dark:text-dark-text tracking-tight">
            Olá, {userName}
          </h1>
          <p className="text-sys-text-sec dark:text-sys-text-sub mt-2 text-sm font-medium">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Today's Focus */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          <div className="bg-sys-card dark:bg-dark-card rounded-3xl p-4 md:p-8 border border-sys-border dark:border-dark-border shadow-soft">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h2 className="text-xl font-bold dark:text-dark-text flex items-center gap-3">
                <div className="w-1.5 h-6 bg-terracotta rounded-full" />
                Foco de Hoje
              </h2>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-action-blue text-sm font-semibold hover:text-action-blue/80 transition-colors flex items-center gap-1"
              >
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2 text-sys-text-sub">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-sys-bg dark:bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-action-blue rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-12 text-sys-text-sub bg-sys-bg/50 dark:bg-dark-bg/50 rounded-2xl border border-dashed border-sys-border dark:border-dark-border">
                  Tudo tranquilo por aqui.
                </div>
              ) : (
                todaysTasks.slice(0, 4).map(task => {
                  const completed = isTaskCompletedToday(task);
                  return (
                    <div key={task.id} className="flex items-center gap-4 group p-2 hover:bg-sys-bg dark:hover:bg-dark-bg/50 rounded-xl transition-colors cursor-pointer" onClick={() => task.recurrence ? onToggleTask(task.id, todayStr) : onToggleTask(task.id)}>
                      <button
                        className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                        ${completed
                            ? 'bg-action-blue border-action-blue text-white'
                            : 'border-sys-border dark:border-dark-border bg-sys-card dark:bg-dark-card hover:border-action-blue'}`}
                      >
                        {completed && <CheckCircle2 size={12} strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-sm font-medium ${completed ? 'line-through text-sys-text-sub' : 'text-sys-text-main dark:text-dark-text'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-sys-card dark:bg-dark-card p-4 md:p-8 rounded-3xl border border-sys-border dark:border-dark-border shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-sys-text-main dark:text-dark-text flex items-center gap-2 text-xl">
                <FileText size={20} className="text-soft-lilac" />
                Notas Recentes
              </h3>
              <button
                onClick={() => onNavigate('notes')}
                className="text-action-blue text-sm font-semibold hover:text-action-blue/80 transition-colors flex items-center gap-1"
              >
                Ver caderno <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.slice(0, 2).map(note => (
                <div key={note.id} className="bg-sys-bg dark:bg-dark-bg p-4 rounded-xl border border-transparent hover:border-soft-lilac/50 hover:shadow-sm transition-all cursor-pointer group" onClick={() => onNavigate('notes')}>
                  <h4 className="font-bold text-sm text-sys-text-main dark:text-dark-text group-hover:text-soft-lilac transition-colors mb-1 truncate">{note.title}</h4>
                  <p className="text-xs text-sys-text-sub line-clamp-2 mb-3 h-8">{note.content || "Sem conteúdo..."}</p>
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-soft-lilac" />
                    <span className="text-[10px] font-bold uppercase text-soft-lilac">{note.category}</span>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-sys-text-sub text-sm opacity-60 bg-sys-bg/50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-sys-border dark:border-dark-border">
                  Sem notas recentes.
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Schedule Sidebar */}
        {/* Schedule Sidebar */}
        <div className="col-span-1 space-y-8">
          <div className="bg-sys-card dark:bg-dark-card rounded-3xl p-4 md:p-8 border border-sys-border dark:border-dark-border shadow-soft flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-dark-text">Agenda</h2>
              <button
                onClick={() => onNavigate('planner')}
                className="text-action-blue text-sm font-semibold hover:text-action-blue/80 transition-colors flex items-center gap-1"
              >
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {/* Timeline */}
              <div className="relative border-l border-sys-border dark:border-dark-border ml-2 space-y-6 pl-6 pb-2">
                {events.slice(0, 3).map((evt) => (
                  <div key={evt.id} className="relative group">
                    <div className={`absolute -left-[29px] w-3 h-3 rounded-full border-2 border-sys-card dark:border-dark-card ring-2 ring-opacity-20 ring-gray-400 ${evt.color}`} />
                    <div className="bg-sys-bg/50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-transparent hover:border-sys-border dark:hover:border-dark-border transition-all">
                      <p className="text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 flex items-center gap-1.5 uppercase tracking-wide">
                        <Clock size={12} />
                        {format(evt.start, "dd/MM")} • {format(evt.start, 'HH:mm')} - {format(evt.end, 'HH:mm')}
                      </p>
                      <p className="font-semibold text-sys-text-main dark:text-dark-text text-sm">{evt.title}</p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-sys-text-sub italic text-center py-4">Agenda livre.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate('planner')}
              className="w-full mt-6 py-3 text-sm font-semibold text-action-blue bg-action-blue/10 hover:bg-action-blue/20 rounded-xl transition-colors"
            >
              Ver agenda completa
            </button>
          </div>

          {/* Kanban Preview */}
          <div className="bg-sys-card dark:bg-dark-card rounded-3xl p-4 md:p-8 border border-sys-border dark:border-dark-border shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-dark-text flex items-center gap-3">
                <Columns size={20} className="text-org-blue" />
                A Fazer
              </h2>
              <button
                onClick={() => onNavigate('kanban')}
                className="text-action-blue text-sm font-semibold hover:text-action-blue/80 transition-colors flex items-center gap-1"
              >
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {kanbanTasks.filter(t => t.status === 'todo').slice(0, 4).map(task => (
                <div key={task.id} className="bg-sys-bg dark:bg-dark-bg p-4 rounded-xl border border-sys-border dark:border-dark-border flex items-start justify-between group hover:shadow-md transition-all">
                  <div>
                    <p className="font-semibold text-sm text-sys-text-main dark:text-dark-text mb-1 line-clamp-2">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-terracotta' : task.priority === 'medium' ? 'bg-soft-lilac' : 'bg-action-blue'
                        }`} title="Prioridade" />
                      <span className="text-xs text-sys-text-sub capitalize">
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {kanbanTasks.filter(t => t.status === 'todo').length === 0 && (
                <div className="text-center py-6 text-sys-text-sub bg-sys-bg/50 dark:bg-dark-bg/50 rounded-2xl border border-dashed border-sys-border dark:border-dark-border text-sm">
                  Tudo feito! Nada pendente.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div >
  );
};

export default Dashboard;
