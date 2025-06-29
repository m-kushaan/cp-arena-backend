import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username:         { type: String, required: true, unique: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  codeforcesHandle: { type: String, required: true, unique: true },
  notifiedContests: {type: [Number],default: []},}
, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
