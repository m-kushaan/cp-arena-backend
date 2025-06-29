// utils/codeforces.js
import axios from 'axios';

let cachedProblems = null;

export const getCodeforcesProblemset = async () => {
  if (!cachedProblems) {
    const res = await axios.get("https://codeforces.com/api/problemset.problems");
    cachedProblems = res.data.result.problems;
  }
  return cachedProblems;
};

export const getFilteredProblems = async ({
  rating = null,
  tag = null,
  excludeSolved = false,
  userHandle = null
} = {}) => {
  const allProblems = await getCodeforcesProblemset();

  let verdictMap = new Map();
  if (excludeSolved && userHandle) {
    const submissionRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${userHandle}`
    );

    for (const sub of submissionRes.data.result) {
      const id = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!verdictMap.has(id)) {
        verdictMap.set(id, sub.verdict);
      }
    }
  }

  const filtered = allProblems
    .filter((p) => {
      const id = `${p.contestId}-${p.index}`;
      const byDifficulty = !rating || p.rating == rating;
      const byTag = !tag || (p.tags && p.tags.includes(tag));
      const notSolved = !excludeSolved || verdictMap.get(id) !== 'OK';
      return byDifficulty && byTag && notSolved;
    })
    .map((p) => {
      const id = `${p.contestId}-${p.index}`;
      return {
        ...p,
        verdict: verdictMap.get(id) || null,
      };
    });

  // Recent first
  filtered.sort((a, b) => {
    if (a.contestId !== b.contestId) return b.contestId - a.contestId;
    return a.index.localeCompare(b.index);
  });

  return filtered;
};
