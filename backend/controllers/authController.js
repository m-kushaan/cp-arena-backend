import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { google } from "googleapis";

import { registerSchema, loginSchema } from "../validations/authValidations.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI  // e.g., http://localhost:5000/api/auth/google/callback
);

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


export const googleLogin = (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI  // e.g., http://localhost:5000/api/auth/google/callback
);
  console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI,  // <-- add this explicitly
});

  res.redirect(url);
};

export const googleAuthCallback = async (req, res) => {
  const code = req.query.code;
  const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI  // e.g., http://localhost:5000/api/auth/google/callback
);
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const { email, name, picture } = userInfo.data;

    // Check if user exists in your DB
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("Please register manually before using Google login.");
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Redirect user to frontend with token as query param (or set cookie)
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed");
  }
};
