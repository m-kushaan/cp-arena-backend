// routes/submissionRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddlewares.js';
import { getContestSubmissionStatus } from '../controllers/submissionController.js';

const router = express.Router();

router.get('/contest/status/:id', authMiddleware, getContestSubmissionStatus);

export default router;
