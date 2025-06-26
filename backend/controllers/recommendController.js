import axios from 'axios';

export const getWeakTopicProblems = async (req, res) => {
  try {
    const cfHandle = req.user.codeforcesHandle;
    if (!cfHandle) {
      return res.status(400).json({ message: 'Codeforces handle not found' });
    }

    // Fetch submissions
    const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${cfHandle}`);
    const submissions = statusRes.data.result;

    const weakTagCount = {};

    submissions.forEach(sub => {
      if (sub.verdict !== 'OK' && sub.problem.tags) {
        sub.problem.tags.forEach(tag => {
          weakTagCount[tag] = (weakTagCount[tag] || 0) + 1;
        });
      }
    });

    // Get top 5 weak tags
    const topTags = Object.entries(weakTagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Fetch all Codeforces problems
    const problemSetRes = await axios.get(`https://codeforces.com/api/problemset.problems`);
    const allProblems = problemSetRes.data.result.problems;

    // For each tag, pick one random unsolved problem
    const recommended = [];

    for (const tag of topTags) {
      const taggedProblems = allProblems.filter(p => p.tags.includes(tag) && p.rating >= 800);

      const alreadySolved = new Set(
        submissions
          .filter(sub => sub.verdict === 'OK')
          .map(sub => `${sub.problem.contestId}-${sub.problem.index}`)
      );

      const unsolvedTagged = taggedProblems.filter(p =>
        !alreadySolved.has(`${p.contestId}-${p.index}`)
      );

      if (unsolvedTagged.length > 0) {
        const randomProblem = unsolvedTagged[Math.floor(Math.random() * unsolvedTagged.length)];
        recommended.push({
          tag,
          problem: {
            name: randomProblem.name,
            rating: randomProblem.rating,
            contestId: randomProblem.contestId,
            index: randomProblem.index,
            link: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`
          }
        });
      }
    }

    res.json({ recommended });

  } catch (err) {
    console.error("❌ Error in getWeakTopicProblems:", err.message);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
};
