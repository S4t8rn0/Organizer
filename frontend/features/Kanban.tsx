import React, { useState } from 'react';
import { KanbanTask, KanbanStatus, Priority } from '../types';
import { Plus, ChevronLeft, ChevronRight, GripVertical, X } from 'lucide-react';
import { PRIORITY_COLORS } from '../constants';
import { kanbanApi } from '../services/api';

interface KanbanProps {
    tasks: KanbanTask[];
    setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>;
}

const COLUMNS: { id: KanbanStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'A Fazer', color: 'border-t-terracotta' },
    { id: 'in-progress', title: 'Em Andamento', color: 'border-t-action-blue' },
    { id: 'review', title: 'Em Análise', color: 'border-t-soft-lilac' },
    { id: 'done', title: 'Concluído', color: 'border-t-org-blue' },
];

const Kanban: React.FC<KanbanProps> = ({ tasks, setTasks }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
    const [newTaskColumn, setNewTaskColumn] = useState<KanbanStatus>('todo');
    const [draggedTask, setDraggedTask] = useState<string | null>(null);

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const created = await kanbanApi.create({
                title: newTaskTitle,
                status: newTaskColumn,
                priority: newTaskPriority,
            });
            const newTask: KanbanTask = {
                ...created,
                createdAt: new Date(created.created_at),
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
            setNewTaskPriority('medium');
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error creating kanban task:', error);
        }
    };

    const moveTask = (taskId: string, newStatus: KanbanStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const deleteTask = async (taskId: string) => {
        try {
            await kanbanApi.delete(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Error deleting kanban task:', error);
        }
    };

    const getNextStatus = (current: KanbanStatus): KanbanStatus | null => {
        const order: KanbanStatus[] = ['todo', 'in-progress', 'review', 'done'];
        const idx = order.indexOf(current);
        return idx < order.length - 1 ? order[idx + 1] : null;
    };

    const getPrevStatus = (current: KanbanStatus): KanbanStatus | null => {
        const order: KanbanStatus[] = ['todo', 'in-progress', 'review', 'done'];
        const idx = order.indexOf(current);
        return idx > 0 ? order[idx - 1] : null;
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTask(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: KanbanStatus) => {
        e.preventDefault();
        if (draggedTask) {
            moveTask(draggedTask, status);
            setDraggedTask(null);
        }
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-2xl font-bold text-sys-text-main dark:text-dark-text tracking-tight pl-2">Kanban</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-action-blue hover:bg-action-blue/90 text-white rounded-xl transition-colors text-sm font-semibold shadow-md"
                >
                    <Plus size={18} />
                    Nova Tarefa
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden">
                {COLUMNS.map(column => {
                    const columnTasks = tasks.filter(t => t.status === column.id);

                    return (
                        <div
                            key={column.id}
                            className={`flex flex-col bg-sys-card dark:bg-dark-card rounded-2xl border border-sys-border dark:border-dark-border shadow-soft overflow-hidden border-t-4 ${column.color}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-sys-border dark:border-dark-border">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sys-text-main dark:text-dark-text">{column.title}</h3>
                                    <span className="bg-sys-bg dark:bg-dark-bg text-sys-text-sub text-xs font-bold px-2 py-1 rounded-lg">
                                        {columnTasks.length}
                                    </span>
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {columnTasks.map(task => {
                                    const prevStatus = getPrevStatus(task.status);
                                    const nextStatus = getNextStatus(task.status);

                                    return (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`group bg-sys-bg dark:bg-dark-bg p-3 rounded-xl border border-sys-border dark:border-dark-border hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${draggedTask === task.id ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <GripVertical size={16} className="text-sys-text-sub mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-sys-text-main dark:text-dark-text mb-1 break-words">{task.title}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${PRIORITY_COLORS[task.priority]}`}>
                                                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-sys-text-sub hover:text-calm-coral transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            {/* Move Buttons */}
                                            <div className="flex justify-center gap-2 mt-2 pt-2 border-t border-sys-border dark:border-dark-border opacity-0 group-hover:opacity-100 transition-opacity">
                                                {prevStatus && (
                                                    <button
                                                        onClick={() => moveTask(task.id, prevStatus)}
                                                        className="flex items-center gap-1 text-xs text-sys-text-sub hover:text-action-blue transition-colors px-2 py-1 rounded-lg hover:bg-action-blue/10"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                )}
                                                {nextStatus && (
                                                    <button
                                                        onClick={() => moveTask(task.id, nextStatus)}
                                                        className="flex items-center gap-1 text-xs text-sys-text-sub hover:text-action-blue transition-colors px-2 py-1 rounded-lg hover:bg-action-blue/10"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {columnTasks.length === 0 && (
                                    <div className="text-center py-8 text-sys-text-sub text-sm opacity-60">
                                        Arraste tarefas aqui
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Task Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-sys-text-main/10 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-sys-card dark:bg-dark-card rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in border border-sys-border dark:border-dark-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-sys-text-main dark:text-dark-text">Nova Tarefa</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-sys-text-sub hover:text-sys-text-main dark:hover:text-dark-text">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">Título</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Descreva a tarefa..."
                                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none focus:ring-1 ring-action-blue dark:text-dark-text"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">Coluna</label>
                                <div className="flex gap-2">
                                    {COLUMNS.map(col => (
                                        <button
                                            key={col.id}
                                            onClick={() => setNewTaskColumn(col.id)}
                                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${newTaskColumn === col.id
                                                ? 'bg-action-blue text-white'
                                                : 'bg-sys-bg dark:bg-dark-bg text-sys-text-sub hover:bg-sys-border dark:hover:bg-dark-border'
                                                }`}
                                        >
                                            {col.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">Prioridade</label>
                                <div className="flex gap-2">
                                    {(['low', 'medium', 'high'] as Priority[]).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setNewTaskPriority(p)}
                                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${newTaskPriority === p
                                                ? p === 'high' ? 'bg-terracotta text-white' : p === 'medium' ? 'bg-soft-lilac text-white' : 'bg-action-blue text-white'
                                                : 'bg-sys-bg dark:bg-dark-bg text-sys-text-sub hover:bg-sys-border dark:hover:bg-dark-border'
                                                }`}
                                        >
                                            {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={addTask}
                                className="w-full bg-action-blue hover:bg-action-blue/90 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
                            >
                                Adicionar Tarefa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kanban;
