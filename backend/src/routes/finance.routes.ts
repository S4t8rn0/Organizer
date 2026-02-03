import { Router } from 'express';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/transactions.controller.js';
import { getBills, createBill, updateBill, toggleBill, deleteBill } from '../controllers/bills.controller.js';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../controllers/investments.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Transactions
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Fixed Bills
router.get('/bills', getBills);
router.post('/bills', createBill);
router.put('/bills/:id', updateBill);
router.patch('/bills/:id/toggle', toggleBill);
router.delete('/bills/:id', deleteBill);

// Investments
router.get('/investments', getInvestments);
router.post('/investments', createInvestment);
router.put('/investments/:id', updateInvestment);
router.delete('/investments/:id', deleteInvestment);

export default router;
