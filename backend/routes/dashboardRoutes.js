import express from 'express';
import authMiddleware from '../middlewares/authMiddlewares.js';
import { getDashboardData } from '../controllers/dashboardController.js';
const router = express.Router();


router.get("/dash", authMiddleware , getDashboardData);

export default router;