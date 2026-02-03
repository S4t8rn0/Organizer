import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Store for tracking failed login attempts per IP
const loginAttempts = new Map<string, { count: number; firstAttempt: number; blocked: boolean; blockedUntil?: number }>();

// Configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block after max attempts
const CLEANUP_INTERVAL_MS = 60 * 1000; // Clean up every minute

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of loginAttempts.entries()) {
        // Remove entries older than window or unblocked entries
        if (data.blocked && data.blockedUntil && now > data.blockedUntil) {
            loginAttempts.delete(ip);
        } else if (!data.blocked && now - data.firstAttempt > LOGIN_WINDOW_MS) {
            loginAttempts.delete(ip);
        }
    }
}, CLEANUP_INTERVAL_MS);

// Get client IP address
const getClientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Anti-bruteforce middleware for login endpoint
 * Tracks failed login attempts and blocks IPs after too many failures
 */
export const antiBruteforceMiddleware = (req: Request, res: Response, next: Function) => {
    const ip = getClientIp(req);
    const now = Date.now();

    const attempt = loginAttempts.get(ip);

    // Check if IP is blocked
    if (attempt?.blocked) {
        if (attempt.blockedUntil && now < attempt.blockedUntil) {
            const remainingMs = attempt.blockedUntil - now;
            const remainingMinutes = Math.ceil(remainingMs / 60000);

            res.status(429).json({
                error: `Muitas tentativas de login. Tente novamente em ${remainingMinutes} minuto(s).`,
                retryAfter: remainingMinutes,
                blocked: true
            });
            return;
        } else {
            // Block expired, reset
            loginAttempts.delete(ip);
        }
    }

    next();
};

/**
 * Record a failed login attempt
 */
export const recordFailedLogin = (req: Request) => {
    const ip = getClientIp(req);
    const now = Date.now();

    const attempt = loginAttempts.get(ip);

    if (!attempt) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now, blocked: false });
    } else {
        // Check if window expired
        if (now - attempt.firstAttempt > LOGIN_WINDOW_MS) {
            // Reset counter
            loginAttempts.set(ip, { count: 1, firstAttempt: now, blocked: false });
        } else {
            attempt.count++;

            // Check if should block
            if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
                attempt.blocked = true;
                attempt.blockedUntil = now + BLOCK_DURATION_MS;
            }
        }
    }
};

/**
 * Record a successful login (clears failed attempts)
 */
export const recordSuccessfulLogin = (req: Request) => {
    const ip = getClientIp(req);
    loginAttempts.delete(ip);
};

/**
 * Get remaining attempts for an IP
 */
export const getRemainingAttempts = (req: Request): number => {
    const ip = getClientIp(req);
    const attempt = loginAttempts.get(ip);

    if (!attempt) return MAX_LOGIN_ATTEMPTS;
    if (attempt.blocked) return 0;

    return Math.max(0, MAX_LOGIN_ATTEMPTS - attempt.count);
};

/**
 * General API rate limiter - prevents DDoS and abuse
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window per IP
    message: {
        error: 'Muitas requisições. Por favor, aguarde alguns minutos.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false, // Disable IPv6 validation warning
});

/**
 * Auth endpoints rate limiter - stricter limits for auth routes
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window per IP for auth endpoints
    message: {
        error: 'Muitas tentativas de autenticação. Por favor, aguarde alguns minutos.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false,
});

/**
 * Login rate limiter - very strict for login endpoint
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Only 10 login attempts per 15 minutes
    message: {
        error: 'Muitas tentativas de login. Por favor, aguarde 15 minutos.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    skipSuccessfulRequests: true, // Don't count successful logins
    validate: false,
});

/**
 * Registration rate limiter - prevent mass account creation
 */
export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Only 5 registrations per hour per IP
    message: {
        error: 'Muitas tentativas de registro. Por favor, tente novamente mais tarde.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false,
});

