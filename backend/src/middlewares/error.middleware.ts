import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
}

export const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const notFoundMiddleware = (req: Request, res: Response) => {
    res.status(404).json({ error: 'Rota não encontrada' });
};
