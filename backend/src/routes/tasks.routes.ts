import { Router } from 'express';
import { getTasks, createTask, updateTask, toggleTask, hideTask, deleteTask } from '../controllers/tasks.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.patch('/:id/hide', hideTask);
router.delete('/:id', deleteTask);

export default router;
