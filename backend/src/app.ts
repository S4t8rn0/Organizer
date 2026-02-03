import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import { generalRateLimiter } from './middlewares/rateLimit.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting - protect against DDoS and abuse
app.use(generalRateLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
});

export default app;
