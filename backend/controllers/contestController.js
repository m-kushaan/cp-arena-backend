import Contest from "../model/contests.js";
import { getRandomProblemByRating } from "../utils/codeforces.js";

export const autoCreateContest = async (req, res) => {
  try {
    const { name, numQuestions, ratings, startTime, endTime } = req.body;

    if (ratings.length !== numQuestions)
      return res.status(400).json({ message: "Number of ratings must match number of questions" });

    const problems = [];

    for (let i = 0; i < numQuestions; i++) {
      const problem = await getRandomProblemByRating(ratings[i]);
      if (!problem) return res.status(404).json({ message: `No problem found for rating ${ratings[i]}` });
      problems.push(problem);
    }

    const contest = new Contest({
      name,
      createdBy: req.user.id,
      participants: [req.user.id], // authMiddleware required
      startTime,
      endTime,
      problems,
      isPrivate: true, // Default to private
      duration: (new Date(endTime) - new Date(startTime)) / (1000 * 60) // duration in minutes
    });

    await contest.save();
    res.status(201).json({ message: "Contest created successfully", contest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get contests created by the logged-in user

export const getMyContests = async (req, res) => {
  try {
    const myContests = await Contest.find({ createdBy: req.user._id });
    res.json(myContests);
  } catch (err) {
    console.error('Error fetching my contests:', err.message);
    res.status(500).json({ message: 'Server error while fetching contests' });
  }
};
