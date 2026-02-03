import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Nome deve ter pelo menos 2 caracteres'),
];

export const loginValidation: ValidationChain[] = [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Senha é obrigatória'),
];

export const refreshTokenValidation: ValidationChain[] = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token é obrigatório'),
];
