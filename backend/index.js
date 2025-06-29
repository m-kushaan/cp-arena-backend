import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import submissionRoutes from './routes/submissionroutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import recommendRoutes from './routes/recommendRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import { startContestReminderCron } from './scheduler/contestReminderScheduler.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Ensure MONGO_URI is present
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

// Initialize express app
const app = express();

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://cp-arena-backend-1.onrender.com'
  ],
  credentials: true,
}));

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contest', contestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/recommend', recommendRoutes);

// DB connection and server start
connectDB();
startContestReminderCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
