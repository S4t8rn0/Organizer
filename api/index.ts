import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { body, param, validationResult, ValidationChain } from 'express-validator';

// ============ ENVIRONMENT VALIDATION ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

// ============ TYPES ============
export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Trabalho' | 'Pessoal' | 'Estudo' | 'Saúde' | 'Espiritual' | 'Outro';
export type NoteCategory = 'Trabalho' | 'Pessoal' | 'Saúde' | 'Igreja' | 'Estudo' | 'Geral';
export type KanbanStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TransactionType = 'income' | 'expense';
export type FinanceCategory = 'Moradia' | 'Alimentação' | 'Transporte' | 'Lazer' | 'Salário' | 'Saúde' | 'Investimento' | 'Outro';
export type Recurrence = 'daily' | 'weekly';

interface AuthenticatedRequest extends Request {
    userId?: string;
    userToken?: string;
}

// Allowed fields for each entity (whitelist approach)
const ALLOWED_FIELDS = {
    tasks: ['title', 'completed', 'date', 'priority', 'category', 'folder_id', 'recurrence'],
    notes: ['title', 'content', 'category', 'tags'],
    calendar_events: ['title', 'start_time', 'end_time', 'description', 'color', 'recurring', 'recurrence'],
    kanban_tasks: ['title', 'description', 'status', 'priority'],
    transactions: ['description', 'amount', 'type', 'category', 'date'],
    fixed_bills: ['title', 'amount', 'due_day', 'paid'],
    investments: ['name', 'type', 'current_value', 'yield_rate']
};

// Sanitize request body to only include allowed fields
const sanitizeBody = (body: Record<string, unknown>, entity: keyof typeof ALLOWED_FIELDS): Record<string, unknown> => {
    const allowed = ALLOWED_FIELDS[entity];
    const sanitized: Record<string, unknown> = {};

    for (const key of allowed) {
        if (body[key] !== undefined) {
            sanitized[key] = body[key];
        }
    }

    return sanitized;
};

// ============ SUPABASE CONFIG ============
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getSupabaseClient = (accessToken?: string): SupabaseClient => {
    if (!accessToken) {
        return supabase;
    }
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
};

// ============ EXPRESS APP ============
const app = express();

// Trust proxy for correct IP detection on Vercel
app.set('trust proxy', 1);

// Security headers (similar to Helmet)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// CORS - Strict configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) {
            callback(null, true);
            return;
        }

        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowed => {
            const normalizedOrigin = origin.replace(/\/$/, '');
            const normalizedAllowed = allowed.replace(/\/$/, '');
            return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

// ============ RATE LIMITING ============
// Note: In-memory rate limiting doesn't persist across serverless invocations
// For production, consider using Vercel KV, Upstash Redis, or similar
// This provides basic protection within a single function instance

const loginAttempts = new Map<string, { count: number; firstAttempt: number; blocked: boolean; blockedUntil?: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

const getClientIp = (req: Request): string => {
    // Vercel passes the real IP in x-forwarded-for
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    // Vercel also provides x-real-ip
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
        return realIp;
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
};

const checkBruteforce = (req: Request, res: Response): boolean => {
    const ip = getClientIp(req);
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (attempt?.blocked) {
        if (attempt.blockedUntil && now < attempt.blockedUntil) {
            const remainingMinutes = Math.ceil((attempt.blockedUntil - now) / 60000);
            res.status(429).json({
                error: `Muitas tentativas de login. Tente novamente em ${remainingMinutes} minuto(s).`,
                retryAfter: remainingMinutes,
                blocked: true
            });
            return false;
        }
        loginAttempts.delete(ip);
    }
    return true;
};

const recordFailedLogin = (req: Request) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (!attempt) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now, blocked: false });
    } else {
        if (now - attempt.firstAttempt > LOGIN_WINDOW_MS) {
            loginAttempts.set(ip, { count: 1, firstAttempt: now, blocked: false });
        } else {
            attempt.count++;
            if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
                attempt.blocked = true;
                attempt.blockedUntil = now + BLOCK_DURATION_MS;
            }
        }
    }
};

const recordSuccessfulLogin = (req: Request) => {
    const ip = getClientIp(req);
    loginAttempts.delete(ip);
};

const getRemainingAttempts = (req: Request): number => {
    const ip = getClientIp(req);
    const attempt = loginAttempts.get(ip);
    if (!attempt) return MAX_LOGIN_ATTEMPTS;
    if (attempt.blocked) return 0;
    return Math.max(0, MAX_LOGIN_ATTEMPTS - attempt.count);
};

// ============ AUTH MIDDLEWARE ============
const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token de autenticação não fornecido' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Validate token format (JWT has 3 parts separated by dots)
        if (!token || token.split('.').length !== 3) {
            res.status(401).json({ error: 'Formato de token inválido' });
            return;
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Token inválido ou expirado' });
            return;
        }

        req.userId = user.id;
        req.userToken = token;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro interno de autenticação' });
    }
};

// ============ VALIDATION ============
const registerValidation: ValidationChain[] = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password')
        .isLength({ min: 6, max: 128 })
        .withMessage('Senha deve ter entre 6 e 128 caracteres')
        .matches(/^[\x20-\x7E]+$/)
        .withMessage('Senha contém caracteres inválidos'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres')
        .escape(),
];

const loginValidation: ValidationChain[] = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
];

const refreshTokenValidation: ValidationChain[] = [
    body('refreshToken').notEmpty().withMessage('Refresh token é obrigatório'),
];

// UUID validation for route parameters
const uuidParamValidation = (paramName: string): ValidationChain =>
    param(paramName).isUUID().withMessage(`${paramName} inválido`);

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: errors.array()[0].msg,
            errors: errors.array()
        });
        return;
    }
    next();
};

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============
app.post('/api/auth/register', registerValidation, handleValidation, async (req: Request, res: Response) => {
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
});

app.post('/api/auth/login', loginValidation, handleValidation, async (req: Request, res: Response) => {
    if (!checkBruteforce(req, res)) return;

    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            recordFailedLogin(req);
            const remaining = getRemainingAttempts(req);
            res.status(401).json({
                error: error.message,
                remainingAttempts: remaining
            });
            return;
        }

        recordSuccessfulLogin(req);

        res.json({
            user: data.user,
            token: data.session?.access_token,
            refreshToken: data.session?.refresh_token
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

app.post('/api/auth/logout', authMiddleware, async (req: Request, res: Response) => {
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
});

app.get('/api/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const token = req.userToken;

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
});

app.post('/api/auth/refresh', refreshTokenValidation, handleValidation, async (req: Request, res: Response) => {
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
});

// ============ TASKS ROUTES ============
app.get('/api/tasks', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('tasks')
            .select('*')
            .eq('user_id', req.userId)
            .order('date', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
});

app.post('/api/tasks', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'tasks');

        const { data, error } = await supabaseClient
            .from('tasks')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

app.put('/api/tasks/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const sanitizedBody = sanitizeBody(req.body, 'tasks');

        const { data, error } = await supabaseClient
            .from('tasks')
            .update(sanitizedBody)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Tarefa não encontrada' });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

app.patch('/api/tasks/:id/toggle', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { data: task, error: fetchError } = await supabaseClient
            .from('tasks')
            .select('completed')
            .eq('id', id)
            .eq('user_id', req.userId)
            .single();

        if (fetchError || !task) {
            res.status(404).json({ error: 'Tarefa não encontrada' });
            return;
        }

        const { data, error } = await supabaseClient
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alternar tarefa' });
    }
});

app.delete('/api/tasks/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
});

// ============ NOTES ROUTES ============
app.get('/api/notes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('notes')
            .select('*')
            .eq('user_id', req.userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notas' });
    }
});

app.post('/api/notes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'notes');

        const { data, error } = await supabaseClient
            .from('notes')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
});

app.put('/api/notes/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const sanitizedBody = sanitizeBody(req.body, 'notes');

        const { data, error } = await supabaseClient
            .from('notes')
            .update({ ...sanitizedBody, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Nota não encontrada' });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar nota' });
    }
});

app.delete('/api/notes/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar nota' });
    }
});

// ============ EVENTS ROUTES ============
app.get('/api/events', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('calendar_events')
            .select('*')
            .eq('user_id', req.userId)
            .order('start_time', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
});

app.post('/api/events', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'calendar_events');

        const { data, error } = await supabaseClient
            .from('calendar_events')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
});

app.put('/api/events/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const sanitizedBody = sanitizeBody(req.body, 'calendar_events');

        const { data, error } = await supabaseClient
            .from('calendar_events')
            .update(sanitizedBody)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Evento não encontrado' });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
});

app.delete('/api/events/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('calendar_events')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
});

// ============ KANBAN ROUTES ============
app.get('/api/kanban', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('kanban_tasks')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefas do kanban' });
    }
});

app.post('/api/kanban', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'kanban_tasks');

        const { data, error } = await supabaseClient
            .from('kanban_tasks')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});

app.put('/api/kanban/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const sanitizedBody = sanitizeBody(req.body, 'kanban_tasks');

        const { data, error } = await supabaseClient
            .from('kanban_tasks')
            .update(sanitizedBody)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Tarefa não encontrada' });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

app.delete('/api/kanban/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('kanban_tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
});

// ============ FINANCE - TRANSACTIONS ============
app.get('/api/finance/transactions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .eq('user_id', req.userId)
            .order('date', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

app.post('/api/finance/transactions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'transactions');

        const { data, error } = await supabaseClient
            .from('transactions')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
});

app.delete('/api/finance/transactions/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar transação' });
    }
});

// ============ FINANCE - BILLS ============
app.get('/api/finance/bills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('fixed_bills')
            .select('*')
            .eq('user_id', req.userId)
            .order('due_day', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar contas fixas' });
    }
});

app.post('/api/finance/bills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'fixed_bills');

        const { data, error } = await supabaseClient
            .from('fixed_bills')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar conta fixa' });
    }
});

app.put('/api/finance/bills/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const sanitizedBody = sanitizeBody(req.body, 'fixed_bills');

        const { data, error } = await supabaseClient
            .from('fixed_bills')
            .update(sanitizedBody)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Conta fixa não encontrada' });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar conta fixa' });
    }
});

app.patch('/api/finance/bills/:id/toggle', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { data: bill, error: fetchError } = await supabaseClient
            .from('fixed_bills')
            .select('paid')
            .eq('id', id)
            .eq('user_id', req.userId)
            .single();

        if (fetchError || !bill) {
            res.status(404).json({ error: 'Conta fixa não encontrada' });
            return;
        }

        const { data, error } = await supabaseClient
            .from('fixed_bills')
            .update({ paid: !bill.paid })
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alternar status da conta' });
    }
});

app.delete('/api/finance/bills/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('fixed_bills')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar conta fixa' });
    }
});

// ============ FINANCE - INVESTMENTS ============
app.get('/api/finance/investments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { data, error } = await supabaseClient
            .from('investments')
            .select('*')
            .eq('user_id', req.userId)
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar investimentos' });
    }
});

app.post('/api/finance/investments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const sanitizedBody = sanitizeBody(req.body, 'investments');

        const { data, error } = await supabaseClient
            .from('investments')
            .insert({ ...sanitizedBody, user_id: req.userId })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar investimento' });
    }
});

app.put('/api/finance/investments/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;
        const sanitizedBody = sanitizeBody(req.body, 'investments');

        const { data, error } = await supabaseClient
            .from('investments')
            .update(sanitizedBody)
            .eq('id', id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Investimento não encontrado' });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar investimento' });
    }
});

app.delete('/api/finance/investments/:id', uuidParamValidation('id'), handleValidation, authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const supabaseClient = getSupabaseClient(req.userToken);
        const { id } = req.params;

        const { error } = await supabaseClient
            .from('investments')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar investimento' });
    }
});

// ============ ERROR HANDLER ============
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'Origem não permitida' });
        return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Export for Vercel
export default app;
