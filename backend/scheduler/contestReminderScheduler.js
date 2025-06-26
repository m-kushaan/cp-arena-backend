// cron/contestReminder.js
import cron from 'node-cron';
import Contest from '../model/contests.js';
import User from '../model/User.js';
import { sendEmail } from '../utils/autobulk.js';

export const startContestReminderCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      const contests = await Contest.find({
        startTime: {
          $gte: new Date(inOneHour.getTime() - 60 * 1000),
          $lte: new Date(inOneHour.getTime() + 60 * 1000),
        },
      });

      for (const contest of contests) {
        for (const userId of contest.participants) {
          const user = await User.findById(userId);
          if (user?.email) {
            const subject = `⏰ Reminder: Your contest "${contest.name}" starts in 1 hour!`;
            const body = `
Hi ${user.username},

Just a quick reminder — your contest "${contest.name}" on CP Arena is starting in 1 hour!

🕒 Start Time (IST): ${new Date(contest.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Login now to prepare:
https://yourapp.com/dashboard

All the best!
– CP Arena Team
`;

            await sendEmail(user.email, subject, body);
            console.log(`✅ Reminder sent to ${user.email}`);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error in reminder cron:", err.message);
    }
  });
};
