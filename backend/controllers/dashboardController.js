import User from '../model/User.js';
import Contest from '../model/contests.js';
import axios from 'axios';
import mongoose from 'mongoose';

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

    // ✅ Validate CF responses
    const validateCF = (res, name) => {
      if (!res.data || res.data.status !== "OK") {
        throw new Error(`Codeforces API error in ${name}: ${res.data?.comment || "Unknown error"}`);
      }
    };
    validateCF(userInfoRes, 'user.info');
    validateCF(ratingRes, 'user.rating');
    validateCF(statusRes, 'user.status');

    const now = new Date();

    // ➤ PRIVATE CONTESTS
    const allMyContests = await Contest.find({
      $or: [
        { participants: new mongoose.Types.ObjectId(req.user._id) },
        { createdBy: new mongoose.Types.ObjectId(req.user._id) }
      ]
    });

    const upcoming = [], ongoing = [], past = [];

    for (const c of allMyContests) {
      if (!c.startTime || !c.endTime) continue;
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      if (start > now) upcoming.push(c);
      else if (start <= now && end > now) ongoing.push(c);
      else past.push(c);
    }

    // ➤ CF CONTESTS
    const cfContestRes = await axios.get("https://codeforces.com/api/contest.list");
    const cfContestsRaw = cfContestRes.data.result || [];

    const cfUpcoming = [], cfOngoing = [];
    cfContestsRaw.forEach(contest => {
      if (contest.phase === "BEFORE") cfUpcoming.push(contest);
      else if (contest.phase === "CODING") cfOngoing.push(contest);
    });

    cfUpcoming.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
    cfOngoing.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

    const cfContests = {
      upcoming: cfUpcoming.slice(0, 2),
      ongoing: cfOngoing.slice(0, 2),
    };

    // ➤ HANDLE NO SUBMISSIONS
    const submissions = statusRes.data.result || [];

    if (submissions.length === 0) {
      return res.json({
        userInfo: userInfoRes.data.result[0],
        ratingHistory: ratingRes.data.result || [],
        submissions: [],
        privateContests: { upcoming, ongoing, past },
        cfContests,
        streakData: [],
        ratingGraph: {},
        tagsSolved: {},
        unsolvedProblems: [],
        weakTopics: {}
      });
    }

    // ➤ STREAK DATA
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

    // ➤ RATING / TAG STATS
    const ratingCount = {}, tagCount = {}, weakTagCount = {};
    const attempted = new Set(), solved = new Set();

    submissions.forEach(sub => {
      const prob = sub.problem;
      const id = `${prob.contestId}-${prob.index}`;
      attempted.add(id);

      if (sub.verdict === "OK") {
        solved.add(id);
        if (prob.rating) {
          ratingCount[prob.rating] = (ratingCount[prob.rating] || 0) + 1;
        }
        if (prob.tags) {
          prob.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      } else {
        if (prob.tags) {
          prob.tags.forEach(tag => {
            weakTagCount[tag] = (weakTagCount[tag] || 0) + 1;
          });
        }
      }
    });

    const unsolvedProblems = [...attempted].filter(id => !solved.has(id));

    // ➤ FINAL RETURN
    return res.json({
      userInfo: userInfoRes.data.result[0],
      ratingHistory: ratingRes.data.result || [],
      submissions,
      privateContests: { upcoming, ongoing, past },
      cfContests,
      streakData: streakData.reverse(),
      ratingGraph: ratingCount,
      tagsSolved: tagCount,
      unsolvedProblems,
      weakTopics: weakTagCount
    });

  } catch (error) {
    console.error('❌ Dashboard Error:', error); // log full error object
    return res.status(500).json({ message: 'Internal Server Error. Could not fetch dashboard data.' });
  }
};
