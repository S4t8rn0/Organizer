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
    <>
      {/* ===== Desktop Sidebar (md+) ===== */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-44 bg-sys-card dark:bg-dark-card border-r border-sys-border dark:border-dark-border flex-col transition-all z-20 shadow-soft">
        <div className="px-8 pb-6 pt-10 flex items-center justify-start">
          <span className="font-display font-bold text-2xl bg-gradient-to-r from-action-blue via-soft-lilac to-terracotta bg-clip-text text-transparent tracking-tight">Organizer</span>
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
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-sys-border dark:border-dark-border space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sys-text-sec dark:text-sys-text-sub hover:bg-sys-bg dark:hover:bg-dark-bg transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-terracotta hover:bg-terracotta/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* ===== Mobile Bottom Navigation (<md) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sys-card dark:bg-dark-card border-t border-sys-border dark:border-dark-border shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px]
                  ${isActive
                    ? 'text-action-blue'
                    : 'text-sys-text-sub active:text-sys-text-main dark:active:text-dark-text'
                  }`}
              >
                <item.icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-action-blue" />
                )}
              </button>
            );
          })}

          {/* Theme toggle — compact */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl text-sys-text-sub active:text-sys-text-main dark:active:text-dark-text transition-colors min-w-[44px] min-h-[44px]"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Logout — compact */}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl text-terracotta/70 active:text-terracotta transition-colors min-w-[44px] min-h-[44px]"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
