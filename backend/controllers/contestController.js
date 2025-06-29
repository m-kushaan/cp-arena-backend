import Contest from "../model/contests.js";
import User from "../model/User.js";
import { getFilteredProblems } from "../utils/codeforces.js";

// ✅ Create contest using only unsolved problems
export const autoCreateContest = async (req, res) => {
  try {
    const { name, numQuestions, ratings, startTime, endTime } = req.body;

    if (ratings.length !== numQuestions)
      return res.status(400).json({ message: "Number of ratings must match number of questions" });

    const user = await User.findById(req.user.id);
    if (!user || !user.codeforcesHandle)
      return res.status(400).json({ message: "Codeforces handle missing for user" });

    const handle = user.codeforcesHandle;
    const problems = [];

    for (let i = 0; i < numQuestions; i++) {
      const filtered = await getFilteredProblems({
        rating: ratings[i],
        excludeSolved: true,
        userHandle: handle,
      });

      if (!filtered.length)
        return res.status(404).json({ message: `No unsolved problem found for rating ${ratings[i]}` });

      const random = filtered[Math.floor(Math.random() * filtered.length)];
      problems.push({
        codeforcesId: `${random.contestId}${random.index}`,
        name: random.name,
        link: `https://codeforces.com/contest/${random.contestId}/problem/${random.index}`,
        contestId: random.contestId,
        index: random.index,
      });
    }

    const contest = new Contest({
      name,
      createdBy: req.user.id,
      participants: [req.user.id],
      startTime,
      endTime,
      problems,
      isPrivate: true,
      duration: (new Date(endTime) - new Date(startTime)) / 60000 // minutes
    });

    await contest.save();
    res.status(201).json({ message: "Contest created successfully", contest });
  } catch (err) {
    console.error("❌ autoCreateContest error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Fetch contests created by the logged-in user
export const getMyContests = async (req, res) => {
  try {
    const myContests = await Contest.find({ createdBy: req.user._id });
    res.json(myContests);
  } catch (err) {
    console.error("❌ getMyContests error:", err.message);
    res.status(500).json({ message: "Server error while fetching contests" });
  }
};
