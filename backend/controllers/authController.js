import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { registerSchema, loginSchema } from "../validations/authValidations.js";

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

export const register = async (req, res) => {
  const result = registerSchema.safeParse(req.body);


  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors.map(e => e.message) });
  }

  const { username, email, password , codeforcesHandle } = result.data;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword ,codeforcesHandle});

    res.status(201).json({ message: "User registered successfully", user: { username, email ,codeforcesHandle} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const login = async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors.map(e => e.message) });
  }

  const { email, password } = result.data;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

