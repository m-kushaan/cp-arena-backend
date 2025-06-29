import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  name: String,
  link: String,
  contestId: Number,
  index: String,
  rating: Number,
});

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  problems: [problemSchema], // array of selected Codeforces problems
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // optional: if you want creator info
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  reminderSent: {
  type: Boolean,
  default: false
}
});

const Contest = mongoose.model("Contest", contestSchema);
export default Contest;
