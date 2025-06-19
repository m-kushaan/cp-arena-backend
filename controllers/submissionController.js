// controllers/submissionController.js
import axios from 'axios';
import Contest from '../models/Contest.js';
import User from '../models/User.js';
import SubmissionStatus from '../models/SubmissionStatus.js';

export const getContestSubmissionStatus = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ error: "Contest not found" });

    const startSec = Math.floor(contest.startTime.getTime() / 1000);
    const endSec = startSec + contest.duration * 60;

    const user = await User.findById(req.user.id);
    if (!user || !user.codeforcesHandle) {
      return res.status(400).json({ error: "Codeforces handle missing for user" });
    }

    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`
    );

    const submissions = submissionsRes.data.result;

    const problemsStatus = await Promise.all(contest.problems.map(async (problem) => {
      const solved = submissions.some(sub =>
        sub.verdict === "OK" &&
        sub.problem.contestId == problem.contestId &&
        sub.problem.index == problem.index &&
        sub.creationTimeSeconds >= startSec &&
        sub.creationTimeSeconds <= endSec
      );

      const verdict = solved ? 'Accepted' : 'Rejected';
      const problemId = `${problem.contestId}${problem.index}`;

      await SubmissionStatus.findOneAndUpdate(
        {
          userHandle: user.codeforcesHandle,
          contestId: contest._id,
          problemId: problemId,
        },
        { verdict },
        { upsert: true, new: true }
      );

      return {
        contestId: problem.contestId,
        index: problem.index,
        solved,
      };
    }));

    res.json({ problemsStatus });

  } catch (err) {
    console.error("Error in getContestSubmissionStatus:", err);
    res.status(500).json({ error: "Failed to check contest status" });
  }
};
