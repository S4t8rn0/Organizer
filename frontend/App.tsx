import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import Planner from './features/Planner';
import Tasks from './features/Tasks';
import Notes from './features/Notes';
import Kanban from './features/Kanban';
import Finance from './features/Finance';
import Login from './features/Login';
import { useAuth } from './contexts/AuthContext';
import { ViewState, Task, Note, CalendarEvent, KanbanTask, Transaction, FixedBill, Investment } from './types';
import { tasksApi, notesApi, eventsApi, kanbanApi, financeApi } from './services/api';
import { Loader2 } from 'lucide-react';

// Helper to format date as YYYY-MM-DD in local timezone (avoids UTC conversion issues)
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to parse date string as local date (avoids timezone offset)
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Application Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedBills, setFixedBills] = useState<FixedBill[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Load data from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsDataLoading(true);
    try {
      const [tasksData, notesData, eventsData, kanbanData, transactionsData, billsData, investmentsData] = await Promise.all([
        tasksApi.getAll(),
        notesApi.getAll(),
        eventsApi.getAll(),
        kanbanApi.getAll(),
        financeApi.getTransactions(),
        financeApi.getBills(),
        financeApi.getInvestments(),
      ]);

      // Convert date strings to Date objects
      setTasks(tasksData.map((t: any) => ({ ...t, date: parseLocalDate(t.date) })));
      setNotes(notesData.map((n: any) => ({ ...n, updatedAt: new Date(n.updated_at) })));
      setEvents(eventsData.map((e: any) => ({
        ...e,
        start: new Date(e.start_time),
        end: new Date(e.end_time)
      })));
      setKanbanTasks(kanbanData.map((k: any) => ({ ...k, createdAt: new Date(k.created_at) })));
      setTransactions(transactionsData.map((t: any) => ({ ...t, date: parseLocalDate(t.date) })));
      setFixedBills(billsData.map((b: any) => ({ ...b, dueDay: b.due_day })));
      setInvestments(investmentsData.map((i: any) => ({
        ...i,
        currentValue: i.current_value,
        yieldRate: i.yield_rate
      })));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Theme Toggling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Tasks
  const addTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const created = await tasksApi.create({
        title: newTask.title,
        completed: newTask.completed,
        date: formatLocalDate(newTask.date),
        priority: newTask.priority,
        category: newTask.category,
        folder_id: newTask.folderId,
        recurrence: newTask.recurrence,
      });
      setTasks([...tasks, { ...created, date: parseLocalDate(created.date) }]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };
  const toggleTask = async (id: string) => {
    try {
      const updated = await tasksApi.toggle(id);
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: updated.completed } : t));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };
  const deleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Events
  const addEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    try {
      const created = await eventsApi.create({
        title: newEvent.title,
        start_time: newEvent.start.toISOString(),
        end_time: newEvent.end.toISOString(),
        description: newEvent.description,
        color: newEvent.color,
        recurring: newEvent.recurring || false,
        recurrence: newEvent.recurrence,
      });
      setEvents([...events, { ...created, start: new Date(created.start_time), end: new Date(created.end_time) }]);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };
  const deleteEvent = async (id: string) => {
    try {
      await eventsApi.delete(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Notes
  const addNote = async (newNote: Omit<Note, 'id'>) => {
    try {
      const created = await notesApi.create({
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags,
      });
      setNotes([{ ...created, updatedAt: new Date(created.updated_at) }, ...notes]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  const updateNote = async (id: string, content: string) => {
    try {
      const updated = await notesApi.update(id, { content });
      setNotes(notes.map(n => n.id === id ? { ...n, content, updatedAt: new Date(updated.updated_at) } : n));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };
  const updateNoteTitle = async (id: string, title: string) => {
    try {
      const updated = await notesApi.update(id, { title });
      setNotes(notes.map(n => n.id === id ? { ...n, title, updatedAt: new Date(updated.updated_at) } : n));
    } catch (error) {
      console.error('Error updating note title:', error);
    }
  };
  const deleteNote = async (id: string) => {
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Kanban - using setTasks wrapper
  const handleSetKanbanTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>> = (action) => {
    if (typeof action === 'function') {
      setKanbanTasks(prev => {
        const newTasks = action(prev);
        // Sync changes to API
        newTasks.forEach(async (task) => {
          const prevTask = prev.find(t => t.id === task.id);
          if (prevTask && prevTask.status !== task.status) {
            try {
              await kanbanApi.update(task.id, { status: task.status });
            } catch (error) {
              console.error('Error updating kanban task:', error);
            }
          }
        });
        return newTasks;
      });
    } else {
      setKanbanTasks(action);
    }
  };

  // Finance
  const addTransaction = async (newTrans: Omit<Transaction, 'id'>) => {
    try {
      const created = await financeApi.createTransaction({
        description: newTrans.description,
        amount: newTrans.amount,
        type: newTrans.type,
        category: newTrans.category,
        date: formatLocalDate(newTrans.date),
      });
      setTransactions([...transactions, { ...created, date: parseLocalDate(created.date) }]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };
  const deleteTransaction = async (id: string) => {
    try {
      await financeApi.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  const toggleBill = async (id: string) => {
    try {
      const updated = await financeApi.toggleBill(id);
      const bill = fixedBills.find(b => b.id === id);

      if (bill && !bill.paid) {
        // Bill was unpaid, now paid - create expense transaction
        const newTransaction: Transaction = {
          id: `bill-${id}-${Date.now()}`,
          description: `Conta Fixa: ${bill.title}`,
          amount: bill.amount,
          type: 'expense',
          category: 'Moradia',
          date: new Date()
        };
        await financeApi.createTransaction({
          description: newTransaction.description,
          amount: newTransaction.amount,
          type: newTransaction.type,
          category: newTransaction.category,
          date: formatLocalDate(newTransaction.date),
        });
        setTransactions([...transactions, newTransaction]);
      }

      setFixedBills(fixedBills.map(b => b.id === id ? { ...b, paid: updated.paid } : b));
    } catch (error) {
      console.error('Error toggling bill:', error);
    }
  };
  const updateBill = async (id: string, updatedBill: Omit<FixedBill, 'id'>) => {
    try {
      await financeApi.updateBill(id, {
        title: updatedBill.title,
        amount: updatedBill.amount,
        due_day: updatedBill.dueDay,
        paid: updatedBill.paid,
      });
      setFixedBills(fixedBills.map(b => b.id === id ? { ...b, ...updatedBill } : b));
    } catch (error) {
      console.error('Error updating bill:', error);
    }
  };
  const addBill = async (newBill: Omit<FixedBill, 'id'>) => {
    try {
      const created = await financeApi.createBill({
        title: newBill.title,
        amount: newBill.amount,
        due_day: newBill.dueDay,
        paid: newBill.paid,
      });
      setFixedBills([...fixedBills, { ...created, dueDay: created.due_day }]);
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };
  const deleteBill = async (id: string) => {
    try {
      await financeApi.deleteBill(id);
      setFixedBills(fixedBills.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };
  const addInvestment = async (newInv: Omit<Investment, 'id'>) => {
    try {
      const created = await financeApi.createInvestment({
        name: newInv.name,
        type: newInv.type,
        current_value: newInv.currentValue,
        yield_rate: newInv.yieldRate,
      });
      setInvestments([...investments, { ...created, currentValue: created.current_value, yieldRate: created.yield_rate }]);
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };
  const deleteInvestment = async (id: string) => {
    try {
      await financeApi.deleteInvestment(id);
      setInvestments(investments.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            tasks={tasks}
            events={events}
            notes={notes}
            kanbanTasks={kanbanTasks}
            onToggleTask={toggleTask}
            onNavigate={setCurrentView}
          />
        );
      case 'planner':
        return (
          <Planner
            events={events}
            tasks={tasks}
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'tasks':
        return <Tasks tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'notes':
        return <Notes notes={notes} addNote={addNote} updateNote={updateNote} updateNoteTitle={updateNoteTitle} deleteNote={deleteNote} />;
      case 'kanban':
        return <Kanban tasks={kanbanTasks} setTasks={handleSetKanbanTasks} />;
      case 'finance':
        return (
          <Finance
            transactions={transactions}
            fixedBills={fixedBills}
            investments={investments}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            onToggleBill={toggleBill}
            onUpdateBill={updateBill}
            onAddBill={addBill}
            onDeleteBill={deleteBill}
            onAddInvestment={addInvestment}
            onDeleteInvestment={deleteInvestment}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-sys-bg dark:bg-dark-bg flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-action-blue" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show loading while fetching data
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-sys-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-action-blue mx-auto mb-4" />
          <p className="text-sys-text-sub">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sys-bg dark:bg-dark-bg text-sys-text-main dark:text-dark-text transition-colors duration-200 font-sans">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={logout}
      />

      {/* Adjusted margin left for smaller sidebar */}
      <main className="flex-1 ml-16 md:ml-44 p-4 md:p-8 overflow-y-auto h-screen bg-sys-bg dark:bg-dark-bg">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
