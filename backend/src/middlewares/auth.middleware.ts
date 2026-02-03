import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token de autenticação não fornecido' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Token inválido ou expirado' });
            return;
        }

        req.userId = user.id;
        req.userToken = token; // Save token for authenticated Supabase client
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro interno de autenticação' });
    }
};
