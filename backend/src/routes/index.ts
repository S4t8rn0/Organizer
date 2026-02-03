import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tasksRoutes from './tasks.routes.js';
import notesRoutes from './notes.routes.js';
import eventsRoutes from './events.routes.js';
import kanbanRoutes from './kanban.routes.js';
import financeRoutes from './finance.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);
router.use('/notes', notesRoutes);
router.use('/events', eventsRoutes);
router.use('/kanban', kanbanRoutes);
router.use('/finance', financeRoutes);

export default router;
