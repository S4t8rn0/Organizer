import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, FileText, Columns, Wallet, Moon, Sun, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDarkMode, toggleTheme, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'tasks', icon: CheckSquare, label: 'Tarefas' },
    { id: 'finance', icon: Wallet, label: 'Finanças' },
    { id: 'notes', icon: FileText, label: 'Caderno' },
    { id: 'kanban', icon: Columns, label: 'Kanban' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-44 bg-sys-card dark:bg-dark-card border-r border-sys-border dark:border-dark-border flex flex-col transition-all z-20 shadow-soft">
      <div className="px-8 pb-6 pt-10 flex items-center justify-center md:justify-start">
        <span className="hidden md:block font-display font-bold text-2xl bg-gradient-to-r from-action-blue via-soft-lilac to-terracotta bg-clip-text text-transparent tracking-tight">Organizer</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                  ? 'bg-action-blue/10 text-action-blue font-semibold'
                  : 'text-sys-text-sec dark:text-sys-text-sub hover:bg-sys-bg dark:hover:bg-dark-bg hover:text-sys-text-main dark:hover:text-dark-text'
                }`}
            >
              <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="hidden md:block text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-sys-border dark:border-dark-border space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-sys-text-sec dark:text-sys-text-sub hover:bg-sys-bg dark:hover:bg-dark-bg transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden md:block text-sm">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-terracotta hover:bg-terracotta/10 transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden md:block text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
