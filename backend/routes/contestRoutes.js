import express from 'express';
import { autoCreateContest, getMyContests } from "../controllers/contestController.js";
import authMiddleware from '../middlewares/authMiddlewares.js';
import Contest from '../model/contests.js'; // ✅ You missed this

const router = express.Router();

router.post("/auto-create", authMiddleware, autoCreateContest);
router.get('/my', authMiddleware, getMyContests);

// ✅ Dynamic contest page route
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
