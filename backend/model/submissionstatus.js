// models/SubmissionStatus.js
import mongoose from 'mongoose';

const submissionStatusSchema = new mongoose.Schema({
  userHandle: { type: String, required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  problemId: { type: String, required: true }, // e.g., "1234A"
  verdict: { type: String, enum: ['Accepted', 'Rejected'], required: true },
}, { timestamps: true });

export default mongoose.model('SubmissionStatus', submissionStatusSchema);
