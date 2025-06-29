// cron/contestReminder.js
import cron from 'node-cron';
import axios from 'axios';
import Contest from '../model/contests.js';
import User from '../model/User.js';
import { sendEmail } from '../utils/autobulk.js';

export const startContestReminderCron = () => {
  // Run every minute
  cron.schedule('*/5 * * * *', async () => {
    setImmediate(async () => {try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      /*
      🔹 1. PRIVATE CONTEST REMINDERS
      */
      const privateContests = await Contest.find({
        startTime: {
          $gte: new Date(inOneHour.getTime() - 60 * 1000),
          $lte: new Date(inOneHour.getTime() + 60 * 1000),
        },
        reminderSent: { $ne: true }
      });

      for (const contest of privateContests) {
        const users = await User.find({ _id: { $in: contest.participants } });

        await Promise.all(users.map(user => {
          if (!user?.email) return null;

          const subject = `⏰ Reminder: Your contest "${contest.name}" starts in 1 hour!`;
          const body = `
Hi ${user.username},

Just a quick reminder — your contest "${contest.name}" on CP Arena is starting in 1 hour!

🕒 Start Time (IST): ${new Date(contest.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Login now to prepare:
https://yourapp.com/dashboard

All the best!
– CP Arena Team`;

          return sendEmail(user.email, subject, body)
            .then(() => console.log(`✅ [Private] Reminder sent to ${user.email}`))
            .catch(err => console.error(`❌ [Private] Failed for ${user.email}:`, err.message));
        }));

        contest.reminderSent = true;
        await contest.save();
      }

      /*
      🔹 2. CODEFORCES CONTEST REMINDERS
      */
      const cfRes = await axios.get("https://codeforces.com/api/contest.list");
      const cfUpcoming = cfRes.data.result.filter(c => {
        return c.phase === "BEFORE" &&
          c.startTimeSeconds >= Math.floor(inOneHour.getTime() / 1000) - 60 &&
          c.startTimeSeconds <= Math.floor(inOneHour.getTime() / 1000) + 60;
      });

      for (const cfContest of cfUpcoming) {
        const users = await User.find({
          codeforcesHandle: { $exists: true, $ne: null },
          notifiedContests: { $ne: cfContest.id }
        });

        await Promise.all(users.map(user => {
          if (!user.email) return null;

          const subject = `🚨 Codeforces Contest "${cfContest.name}" starts in 1 hour!`;
          const body = `
Hi ${user.username},

Heads up! A new Codeforces contest is starting soon.

📛 Contest: ${cfContest.name}
🕒 Start Time (IST): ${new Date(cfContest.startTimeSeconds * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

🔗 Join here: https://codeforces.com/contests

Best of luck!
– CP Arena Bot`;

          return sendEmail(user.email, subject, body)
            .then(() => console.log(`✅ [CF] Reminder sent to ${user.email}`))
            .catch(err => console.error(`❌ [CF] Failed for ${user.email}:`, err.message));
        }));

        // 🧠 Mark all users as notified for this CF contest
        await User.updateMany(
          { _id: { $in: users.map(u => u._id) } },
          { $addToSet: { notifiedContests: cfContest.id } }
        );
      }

    } catch (err) {
      console.error("❌ Error in reminder cron:", err.message);
    }
  });
  });
};
