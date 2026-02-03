import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';
import { recordFailedLogin, recordSuccessfulLogin, getRemainingAttempts } from '../middlewares/rateLimit.middleware.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: name || '' }
            }
        });

        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(201).json({
            message: 'Conta criada com sucesso! Verifique seu email.',
            user: data.user
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            // Record failed login attempt for anti-bruteforce
            recordFailedLogin(req);
            const remaining = getRemainingAttempts(req);

            res.status(401).json({
                error: error.message,
                remainingAttempts: remaining
            });
            return;
        }

        // Clear failed attempts on successful login
        recordSuccessfulLogin(req);

        res.json({
            user: data.user,
            token: data.session?.access_token,
            refreshToken: data.session?.refresh_token
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer logout' });
    }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || ''
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        res.json({
            token: data.session?.access_token,
            refreshToken: data.session?.refresh_token
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao renovar token' });
    }
};
