import Contest from "../models/Contest.js";
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
      createdBy: req.user.id, // authMiddleware required
      startTime,
      endTime,
      problems,
      isPrivate: false
    });

    await contest.save();
    res.status(201).json({ message: "Contest created successfully", contest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
