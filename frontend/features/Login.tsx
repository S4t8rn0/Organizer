import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegister) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sys-bg via-sys-card to-sys-bg dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-action-blue via-soft-lilac to-terracotta bg-clip-text text-transparent tracking-tight">Organizer</h1>
                    <p className="text-sys-text-sub mt-2">Organize sua vida em um só lugar</p>
                </div>

                {/* Form Card */}
                <div className="bg-sys-card dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-sys-border dark:border-dark-border">
                    <h2 className="text-xl font-bold text-sys-text-main dark:text-dark-text mb-6">
                        {isRegister ? 'Criar Conta' : 'Entrar'}
                    </h2>

                    {error && (
                        <div className="bg-terracotta/10 border border-terracotta text-terracotta px-4 py-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">
                                    Nome
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sys-text-sub" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 pl-10 text-sm outline-none focus:ring-2 ring-action-blue dark:text-dark-text"
                                        required={isRegister}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sys-text-sub" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 pl-10 text-sm outline-none focus:ring-2 ring-action-blue dark:text-dark-text"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-sys-text-sec dark:text-sys-text-sub mb-2 uppercase tracking-wide">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sys-text-sub" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-sys-bg dark:bg-dark-bg rounded-xl p-3 pl-10 text-sm outline-none focus:ring-2 ring-action-blue dark:text-dark-text"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-action-blue hover:bg-action-blue/90 disabled:bg-action-blue/50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Aguarde...
                                </>
                            ) : (
                                isRegister ? 'Criar Conta' : 'Entrar'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-sm text-action-blue hover:underline"
                        >
                            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
