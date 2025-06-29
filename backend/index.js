import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import submissionRoutes from './routes/submissionroutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import recommendRoutes from './routes/recommendRoutes.js';  // ✅ NEW IMPORT
import cors from 'cors';
import { startContestReminderCron } from './scheduler/contestReminderScheduler.js';



import path from 'path';
import { fileURLToPath } from 'url';
import problemRoutes from './routes/problemRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // allow requests from frontend dev server
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contest', contestRoutes);
app.use('/api/dashboard',dashboardRoutes)
app.use('/api/problems', problemRoutes);
app.use('/api/recommend', recommendRoutes);



connectDB();

startContestReminderCron(); 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
