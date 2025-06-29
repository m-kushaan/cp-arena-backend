import { getFilteredProblems } from '../utils/codeforces.js';

export const getCodeforcesProblems = async (req, res) => {
  const { difficulty, tag, excludeSolved } = req.query;
  const user = req.user;

  try {
    const problems = await getFilteredProblems({
      rating: difficulty || null,
      tag: tag || null,
      excludeSolved: excludeSolved === 'true',
      userHandle: excludeSolved === 'true' ? user.codeforcesHandle : null,
    });

    res.json({ problems: problems.slice(0, 100) }); // only return first 100 problems
  } catch (err) {
    console.error("❌ Problem fetching failed:", err.message);
    res.status(500).json({ message: 'Failed to fetch Codeforces problems' });
  }
};
