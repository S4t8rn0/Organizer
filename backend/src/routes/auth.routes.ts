import { Router } from 'express';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { register, login, logout, getMe, refreshToken } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { registerValidation, loginValidation, refreshTokenValidation } from '../middlewares/validation.middleware.js';
import {
    authRateLimiter,
    loginRateLimiter,
    registerRateLimiter,
    antiBruteforceMiddleware
} from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Apply general auth rate limiter to all auth routes
router.use(authRateLimiter);

// Middleware to handle validation errors
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

// Register with strict rate limiting (5 per hour per IP)
router.post('/register', registerRateLimiter, registerValidation, handleValidation, register);

// Login with anti-bruteforce protection and rate limiting
router.post('/login', loginRateLimiter, antiBruteforceMiddleware, loginValidation, handleValidation, login);

// Logout requires authentication to prevent abuse
router.post('/logout', authMiddleware, logout);

// Refresh token with validation
router.post('/refresh', refreshTokenValidation, handleValidation, refreshToken);

// Get current user - requires authentication
router.get('/me', authMiddleware, getMe);

export default router;

