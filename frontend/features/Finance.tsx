import React, { useState } from 'react';
import { Transaction, FixedBill, Investment, FinanceCategory } from '../types';
import { FINANCE_CATEGORIES } from '../constants';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, Trash2, TrendingUp, Wallet, CheckSquare, Square, Pencil, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceProps {
  transactions: Transaction[];
  fixedBills: FixedBill[];
  investments: Investment[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleBill: (id: string) => void;
  onUpdateBill: (id: string, bill: Omit<FixedBill, 'id'>) => void;
  onAddBill: (bill: Omit<FixedBill, 'id'>) => void;
  onDeleteBill: (id: string) => void;
  onAddInvestment: (i: Omit<Investment, 'id'>) => void;
  onDeleteInvestment: (id: string) => void;
}

const Finance: React.FC<FinanceProps> = ({
  transactions,
  fixedBills,
  investments,
  onAddTransaction,
  onDeleteTransaction,
  onToggleBill,
  onUpdateBill,
  onAddBill,
  onDeleteBill,
  onAddInvestment,
  onDeleteInvestment
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'investments'>('daily');

  // Transaction Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<FinanceCategory>('Alimentação');

  // Investment Form State
  const [invName, setInvName] = useState('');
  const [invValue, setInvValue] = useState('');
  const [invType, setInvType] = useState('Ações');

  // Edit Bill Modal State
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<FixedBill | null>(null);
  const [editBillTitle, setEditBillTitle] = useState('');
  const [editBillAmount, setEditBillAmount] = useState('');
  const [editBillDueDay, setEditBillDueDay] = useState('');

  // Add Bill Modal State
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDay, setNewBillDueDay] = useState('');

  // Calculations
  const currentMonth = new Date().getMonth();
  const monthlyTransactions = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalance = income - expenses;
  const investmentTotal = investments.reduce((acc, curr) => acc + curr.currentValue, 0);

  // Category Analysis
  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    onAddTransaction({
      description: desc,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date()
    });
    setDesc('');
    setAmount('');
  };

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || !invValue) return;
    onAddInvestment({
      name: invName,
      currentValue: parseFloat(invValue),
      type: invType,
      yieldRate: 0
    });
    setInvName('');
    setInvValue('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenEditBill = (bill: FixedBill) => {
    setEditingBill(bill);
    setEditBillTitle(bill.title);
    setEditBillAmount(bill.amount.toString());
    setEditBillDueDay(bill.dueDay.toString());
    setIsEditBillModalOpen(true);
  };

  const handleSaveEditBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill || !editBillTitle || !editBillAmount || !editBillDueDay) return;
    onUpdateBill(editingBill.id, {
      title: editBillTitle,
      amount: parseFloat(editBillAmount),
      dueDay: parseInt(editBillDueDay),
      paid: editingBill.paid
    });
    setIsEditBillModalOpen(false);
    setEditingBill(null);
  };

  const handleDeleteBill = () => {
    if (!editingBill) return;
    onDeleteBill(editingBill.id);
    setIsEditBillModalOpen(false);
    setEditingBill(null);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillTitle || !newBillAmount || !newBillDueDay) return;
    onAddBill({
      title: newBillTitle,
      amount: parseFloat(newBillAmount),
      dueDay: parseInt(newBillDueDay),
      paid: false
    });
    setIsAddBillModalOpen(false);
    setNewBillTitle('');
    setNewBillAmount('');
    setNewBillDueDay('');
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in max-w-6xl mx-auto overflow-y-auto pb-8">

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-sys-text-main dark:text-dark-text tracking-tight pl-2">Finanças</h2>

      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-terracotta to-[#E8B08B] text-white p-4 md:p-6 rounded-3xl shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100} /></div>
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">Saldo</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{formatCurrency(totalBalance)}</h2>
          <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Wallet size={12} />
            <span>Saldo Atual</span>
          </div>
        </div>

        <div className="bg-sys-card dark:bg-dark-card p-4 md:p-6 rounded-3xl border border-sys-border dark:border-dark-border shadow-soft flex items-center justify-between">
          <div>
            <p className="text-sys-text-sec dark:text-sys-text-sub text-sm font-bold uppercase tracking-wider">Entradas</p>
            <h2 className="text-2xl font-bold text-action-blue">{formatCurrency(income)}</h2>
          </div>
          <div className="bg-action-blue/10 p-3 rounded-full text-action-blue">
            <ArrowUpCircle size={24} />
          </div>
        </div>

        <div className="bg-sys-card dark:bg-dark-card p-4 md:p-6 rounded-3xl border border-sys-border dark:border-dark-border shadow-soft flex items-center justify-between">
          <div>
            <p className="text-sys-text-sec dark:text-sys-text-sub text-sm font-bold uppercase tracking-wider">Saídas</p>
            <h2 className="text-2xl font-bold text-calm-coral">{formatCurrency(expenses)}</h2>
          </div>
          <div className="bg-calm-coral/10 p-3 rounded-full text-calm-coral">
            <ArrowDownCircle size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-sys-border dark:border-dark-border">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'daily' ? 'text-action-blue border-b-2 border-action-blue' : 'text-sys-text-sub'}`}
        >
          Controle Diário
        </button>
        <button
          onClick={() => setActiveTab('investments')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'investments' ? 'text-action-blue border-b-2 border-action-blue' : 'text-sys-text-sub'}`}
        >
          Investimentos
        </button>
      </div>

      {activeTab === 'daily' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column: Transactions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Add Form */}
            <form onSubmit={handleAddTransaction} className="bg-sys-card dark:bg-dark-card p-6 rounded-3xl border border-sys-border dark:border-dark-border flex flex-col sm:flex-row gap-3 items-end shadow-soft">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold uppercase tracking-wider text-sys-text-sub mb-2 block">Descrição</label>
                <input
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Supermercado"
                  className="w-full bg-sys-bg dark:bg-dark-bg px-4 py-2.5 rounded-xl text-sm outline-none border border-transparent focus:border-terracotta dark:text-dark-text"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="text-xs font-bold uppercase tracking-wider text-sys-text-sub mb-2 block">Valor</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-sys-bg dark:bg-dark-bg px-4 py-2.5 rounded-xl text-sm outline-none border border-transparent focus:border-terracotta dark:text-dark-text"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="text-xs font-bold uppercase tracking-wider text-sys-text-sub mb-2 block">Tipo</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-sys-bg dark:bg-dark-bg px-4 py-2.5 rounded-xl text-sm outline-none border border-transparent focus:border-terracotta dark:text-dark-text"
                >
                  <option value="expense">Saída</option>
                  <option value="income">Entrada</option>
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label className="text-xs font-bold uppercase tracking-wider text-sys-text-sub mb-2 block">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-sys-bg dark:bg-dark-bg px-4 py-2.5 rounded-xl text-sm outline-none border border-transparent focus:border-terracotta dark:text-dark-text"
                >
                  {FINANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full sm:w-auto bg-action-blue hover:bg-action-blue/90 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Plus size={18} />
                <span className="sm:hidden">Adicionar</span>
              </button>
            </form>

            {/* Transaction List */}
            <div className="bg-sys-card dark:bg-dark-card rounded-3xl border border-sys-border dark:border-dark-border overflow-hidden shadow-soft">
              <div className="p-5 border-b border-sys-border dark:border-dark-border font-bold text-sys-text-main dark:text-dark-text">
                Histórico Recente
              </div>
              <div className="divide-y divide-sys-border dark:divide-dark-border">
                {monthlyTransactions.length === 0 ? (
                  <div className="p-8 text-center text-sys-text-sub text-sm">Nenhuma transação este mês.</div>
                ) : (
                  monthlyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id} className="p-5 flex items-center justify-between hover:bg-sys-bg dark:hover:bg-dark-bg transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-action-blue/10 text-action-blue' : 'bg-calm-coral/10 text-calm-coral'}`}>
                          {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sys-text-main dark:text-dark-text text-sm">{t.description}</p>
                          <p className="text-xs text-sys-text-sub font-medium">{t.category} • {format(t.date, 'dd/MM')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-action-blue' : 'text-calm-coral'}`}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                        <button onClick={() => onDeleteTransaction(t.id)} className="text-sys-text-sub hover:text-calm-coral opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Fixed Bills & Charts */}
          <div className="space-y-6">

            {/* Fixed Bills */}
            <div className="bg-sys-card dark:bg-dark-card rounded-3xl border border-sys-border dark:border-dark-border p-6 shadow-soft">
              <h3 className="font-bold text-sys-text-main dark:text-dark-text mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckSquare size={18} /> Contas Fixas
                </span>
                <button
                  onClick={() => setIsAddBillModalOpen(true)}
                  className="text-sys-text-sub hover:text-action-blue transition-colors p-1"
                >
                  <Plus size={18} />
                </button>
              </h3>
              <div className="space-y-3">
                {fixedBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-sys-bg dark:hover:bg-dark-bg transition-colors">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onToggleBill(bill.id)} className={bill.paid ? 'text-action-blue' : 'text-sys-border dark:text-dark-border'}>
                        {bill.paid ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${bill.paid ? 'text-sys-text-sub line-through' : 'text-sys-text-main dark:text-dark-text'}`}>{bill.title}</p>
                        <p className="text-[10px] text-sys-text-sub font-bold uppercase">Dia {bill.dueDay}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-sys-text-sec dark:text-sys-text-sub">{formatCurrency(bill.amount)}</span>
                      <button
                        onClick={() => handleOpenEditBill(bill)}
                        className="text-sys-text-sub hover:text-action-blue transition-colors p-1"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Summary Chart */}
            <div className="bg-sys-card dark:bg-dark-card rounded-3xl border border-sys-border dark:border-dark-border p-6 shadow-soft">
              <h3 className="font-bold text-sys-text-main dark:text-dark-text mb-4">Resumo por Categoria</h3>
              <div className="space-y-4">
                {(Object.entries(expensesByCategory) as [string, number][]).map(([cat, val]) => {
                  const percent = Math.min(100, Math.round((val / expenses) * 100));
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-sys-text-sec dark:text-sys-text-sub">{cat}</span>
                        <span className="text-sys-text-sub">{percent}% ({formatCurrency(val)})</span>
                      </div>
                      <div className="h-2 w-full bg-sys-bg dark:bg-dark-bg rounded-full overflow-hidden">
                        <div className="h-full bg-calm-coral rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
                {expenses === 0 && <p className="text-xs text-sys-text-sub italic">Sem gastos registrados.</p>}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Investments Tab */
        <div className="bg-sys-card dark:bg-dark-card rounded-3xl border border-sys-border dark:border-dark-border p-8 shadow-soft">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-sys-text-main dark:text-dark-text flex items-center gap-2">
                <TrendingUp className="text-action-blue" />
                Carteira de Investimentos
              </h2>
              <p className="text-sm text-sys-text-sub font-medium mt-1">Total acumulado: <span className="font-bold text-sys-text-main dark:text-dark-text">{formatCurrency(investmentTotal)}</span></p>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <input
                placeholder="Ativo (Ex: PETR4)"
                value={invName}
                onChange={e => setInvName(e.target.value)}
                className="bg-sys-bg dark:bg-dark-bg px-4 py-2.5 rounded-xl text-sm outline-none w-full md:w-32 dark:text-dark-text border border-transparent focus:border-terracotta"
              />
              <input
                placeholder="Valor"
                type="number"
                value={invValue}
                onChange={e => setInvValue(e.target.value)}
                className="bg-sys-bg dark:bg-dark-bg px-4 py-2.5 rounded-xl text-sm outline-none w-full md:w-28 dark:text-dark-text border border-transparent focus:border-terracotta"
              />
              <button onClick={handleAddInvestment} className="bg-action-blue hover:bg-action-blue/90 text-white px-4 py-2.5 rounded-xl transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map(inv => (
              <div key={inv.id} className="p-6 rounded-2xl border border-sys-border dark:border-dark-border hover:shadow-soft transition-shadow bg-sys-bg/30 dark:bg-dark-bg/30 group relative">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-terracotta/10 text-terracotta text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">{inv.type}</span>
                  <button
                    onClick={() => onDeleteInvestment(inv.id)}
                    className="text-sys-text-sub hover:text-calm-coral transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-bold text-lg text-sys-text-main dark:text-dark-text">{inv.name}</h3>
                <p className="text-2xl font-bold text-action-blue mt-2">{formatCurrency(inv.currentValue)}</p>
                <p className="text-xs text-sys-text-sub mt-1">Rendimento n/a</p>
              </div>
            ))}
            {investments.length === 0 && (
              <div className="col-span-full py-12 text-center text-sys-text-sub border-2 border-dashed border-sys-border dark:border-dark-border rounded-xl">
                Comece a registrar seus investimentos acima.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {isEditBillModalOpen && editingBill && (
        <div className="fixed inset-0 bg-sys-text-main/10 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sys-card dark:bg-dark-card rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in border border-sys-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-sys-text-main dark:text-dark-text">Editar Conta Fixa</h3>
              <button onClick={() => setIsEditBillModalOpen(false)} className="text-sys-text-sub hover:text-sys-text-main dark:hover:text-dark-text">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Título</label>
                <input
                  type="text"
                  required
                  value={editBillTitle}
                  onChange={e => setEditBillTitle(e.target.value)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none focus:ring-1 ring-action-blue dark:text-dark-text border border-transparent transition-all"
                  placeholder="Ex: Aluguel"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={editBillAmount}
                    onChange={e => setEditBillAmount(e.target.value)}
                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Dia Vencimento</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={editBillDueDay}
                    onChange={e => setEditBillDueDay(e.target.value)}
                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleDeleteBill}
                  className="flex-1 bg-calm-coral/10 hover:bg-calm-coral/20 text-calm-coral font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Excluir
                </button>
                <button type="submit" className="flex-1 bg-action-blue hover:bg-action-blue/90 text-white font-semibold py-3 rounded-xl transition-colors">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {isAddBillModalOpen && (
        <div className="fixed inset-0 bg-sys-text-main/10 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sys-card dark:bg-dark-card rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in border border-sys-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-sys-text-main dark:text-dark-text">Nova Conta Fixa</h3>
              <button onClick={() => setIsAddBillModalOpen(false)} className="text-sys-text-sub hover:text-sys-text-main dark:hover:text-dark-text">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Título</label>
                <input
                  type="text"
                  required
                  value={newBillTitle}
                  onChange={e => setNewBillTitle(e.target.value)}
                  className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none focus:ring-1 ring-action-blue dark:text-dark-text border border-transparent transition-all"
                  placeholder="Ex: Aluguel"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={newBillAmount}
                    onChange={e => setNewBillAmount(e.target.value)}
                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-1 uppercase tracking-wide">Dia Vencimento</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={newBillDueDay}
                    onChange={e => setNewBillDueDay(e.target.value)}
                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 text-sm outline-none dark:text-dark-text"
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-action-blue hover:bg-action-blue/90 text-white font-semibold py-3 rounded-xl transition-colors">
                  Adicionar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Finance;