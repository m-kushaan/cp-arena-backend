import { autoCreateContest } from "../controllers/contestController.js";
import authMiddleware from '../middlewares/authMiddlewares.js';
import { getMyContests } from '../controllers/contestController.js';

import express from 'express';
const router = express.Router();


router.post("/auto-create", authMiddleware, autoCreateContest);
router.get('/my', authMiddleware, getMyContests);

export default router;
