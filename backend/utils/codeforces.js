import axios from "axios";

// Get problemset once (can later cache it)
let cachedProblems = null;

export const getRandomProblemByRating = async (rating) => {
  if (!cachedProblems) {
    const res = await axios.get("https://codeforces.com/api/problemset.problems");
    cachedProblems = res.data.result.problems;
  }

  const filtered = cachedProblems.filter(
    (p) => p.rating === rating && p.contestId && p.index
  );

  if (filtered.length === 0) return null;

  const random = filtered[Math.floor(Math.random() * filtered.length)];

  return {
    codeforcesId: `${random.contestId}${random.index}`,
    name: random.name,
    link: `https://codeforces.com/contest/${random.contestId}/problem/${random.index}`,
    contestId: random.contestId,
    index: random.index,
  };
};
