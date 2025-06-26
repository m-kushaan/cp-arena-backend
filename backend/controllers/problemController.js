import axios from 'axios';
import { getCodeforcesProblemset } from '../utils/codeforces.js';

export const getCodeforcesProblems = async (req, res) => {
  const { difficulty, tag, excludeSolved } = req.query;
  const handle = req.user.codeforcesHandle;

  try {
    const allProblems = await getCodeforcesProblemset(); // cached

    let solvedSet = new Set();
    if (excludeSolved === 'true' && handle) {
      const submissionRes = await axios.get(
        `https://codeforces.com/api/user.status?handle=${handle}`
      );

      for (const sub of submissionRes.data.result) {
        if (sub.verdict === 'OK') {
          solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
      }
    }

    const filtered = allProblems.filter((p) => {
      const id = `${p.contestId}-${p.index}`;
      const byDifficulty = !difficulty || p.rating == difficulty;
      const byTag = !tag || (p.tags && p.tags.includes(tag));
      const notSolved = excludeSolved !== 'true' || !solvedSet.has(id);

      return byDifficulty && byTag && notSolved;
    });

    res.json({ problems: filtered.slice(0, 100) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch Codeforces problems' });
  }
};
