import Contest from '../model/contests.js';
import User from '../model/User.js';
import SubmissionStatus from '../model/submissionstatus.js';  
import axios from 'axios';

export const getContestSubmissionStatus = async (req, res) => {
  try {
    console.log("📥 Contest ID from params:", req.params.id);

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      console.log("❌ Contest not found");
      return res.status(404).json({ error: "Contest not found" });
    }

    const startSec = Math.floor(contest.startTime.getTime() / 1000);
    const endSec = startSec + contest.duration * 60;
    console.log("⏱ Contest Start (sec):", startSec, "End (sec):", endSec);

    const user = await User.findById(req.user.id);
    if (!user || !user.codeforcesHandle) {
      console.log("❌ User or Codeforces handle missing:", user);
      return res.status(400).json({ error: "Codeforces handle missing for user" });
    }

    console.log("🔗 Fetching submissions for:", user.codeforcesHandle);
    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`
    );
    const submissions = submissionsRes.data.result;
    console.log("📄 Total submissions fetched:", submissions.length);

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
      console.log(`🧪 ${problemId} verdict:`, verdict);

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

    return res.json({ problemsStatus });

  } catch (err) {
    console.error("❌ Error in getContestSubmissionStatus:", err);
    res.status(500).json({ error: "Failed to check contest status" });
  }
};
