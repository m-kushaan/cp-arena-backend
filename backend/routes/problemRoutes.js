// backend/routes/problemRoutes.js

import express from 'express';
import { getCodeforcesProblems } from '../controllers/problemController.js';
import authMiddleware from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.get('/', authMiddleware, getCodeforcesProblems);

export default router; // ✅ ES module style export
