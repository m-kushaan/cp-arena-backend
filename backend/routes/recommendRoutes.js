import express from 'express';
import { getWeakTopicProblems } from '../controllers/recommendController.js';
import authMiddleware from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.get('/weak-topics', authMiddleware, getWeakTopicProblems);

export default router;
