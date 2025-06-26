import axios from "axios";

// Shared cache
let cachedProblems = null;

export const getCodeforcesProblemset = async () => {
  if (!cachedProblems) {
    const res = await axios.get("https://codeforces.com/api/problemset.problems");
    cachedProblems = res.data.result.problems;
  }
  return cachedProblems;
};

export const getRandomProblemByRating = async (rating) => {
  const problems = await getCodeforcesProblemset();

  const filtered = problems.filter(
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
