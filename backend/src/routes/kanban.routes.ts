import { Router } from 'express';
import { getKanbanTasks, createKanbanTask, updateKanbanTask, deleteKanbanTask } from '../controllers/kanban.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getKanbanTasks);
router.post('/', createKanbanTask);
router.put('/:id', updateKanbanTask);
router.delete('/:id', deleteKanbanTask);

export default router;
