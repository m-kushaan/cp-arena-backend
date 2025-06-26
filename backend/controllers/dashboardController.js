// GET /api/dashboard
import User from '../model/User.js';
import Contest from '../model/contests.js';
import axios from 'axios';

export const getDashboardData = async (req, res) => {
  try {
    const cfHandle = req.user.codeforcesHandle;
    if (!cfHandle) {
      return res.status(400).json({ message: 'Codeforces handle not found' });
    }

    const [userInfoRes, ratingRes, statusRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${cfHandle}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${cfHandle}`),
      axios.get(`https://codeforces.com/api/user.status?handle=${cfHandle}`)
    ]);

    const now = new Date();

    // ➤ CLASSIFY PRIVATE CONTESTS
    const allMyContests = await Contest.find({
      $or: [{ participants: req.user._id }, { createdBy: req.user._id }]
    });

    const upcoming = [], ongoing = [], past = [];

    for (const c of allMyContests) {
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      if (start > now) upcoming.push(c);
      else if (start <= now && end > now) ongoing.push(c);
      else past.push(c);
    }

    // ➤ STREAK TRACKER
    const submissions = statusRes.data.result;
    const solvedDatesSet = new Set();

    submissions.forEach(sub => {
      if (sub.verdict === "OK") {
        const date = new Date(sub.creationTimeSeconds * 1000);
        const iso = date.toISOString().split('T')[0];
        solvedDatesSet.add(iso);
      }
    });

    const streakData = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      streakData.push({
        date: iso,
        solved: solvedDatesSet.has(iso)
      });
    }

    // ➤ RATING / TAG / WEAK TOPIC / UNSOLVED STATS
    const ratingCount = {};
    const tagCount = {};
    const weakTagCount = {};

    const attempted = new Set();
    const solved = new Set();

    submissions.forEach(sub => {
      const prob = sub.problem;
      const id = `${prob.contestId}-${prob.index}`;

      // Record all attempts
      attempted.add(id);

      if (sub.verdict === "OK") {
        solved.add(id); // Track solved problems

        if (prob.rating) {
          ratingCount[prob.rating] = (ratingCount[prob.rating] || 0) + 1;
        }
        if (prob.tags) {
          prob.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }

      } else {
        // Only increment weak tags if not accepted
        if (prob.tags) {
          prob.tags.forEach(tag => {
            weakTagCount[tag] = (weakTagCount[tag] || 0) + 1;
          });
        }
      }
    });

    const unsolvedProblems = [...attempted].filter(id => !solved.has(id));

    // ➤ Return everything
    return res.json({
      userInfo: userInfoRes.data.result[0],
      ratingHistory: ratingRes.data.result,
      submissions,
      privateContests: { upcoming, ongoing, past },
      streakData: streakData.reverse(),
      ratingGraph: ratingCount,
      tagsSolved: tagCount,
      unsolvedProblems,
      weakTopics: weakTagCount
    });

  } catch (error) {
    console.error('Dashboard Error:', error.message);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};
