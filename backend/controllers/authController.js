import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { google } from 'googleapis';
import { registerSchema, loginSchema } from '../validations/authValidations.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

const isProd = process.env.NODE_ENV === 'production';

// TEMPORARY fallback values (remove later when .env loads properly)
const fallback = {
  dev: {
    clientId: "477333779382-da6b43mgmohuqlisuvi8akk9f4lqtnh2.apps.googleusercontent.com",
    secret: "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",
    redirect: "http://localhost:5000/api/auth/google/callback",
  },
  prod: {
    clientId: "477333779382-qmjeaiaevki3vq57jho6qr22c5qqb37v.apps.googleusercontent.com",
    secret: "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",
    redirect: "https://cp-arena-backend.onrender.com/api/auth/google/callback",
  }
};

const GOOGLE_CLIENT_ID = process.env[isProd ? 'GOOGLE_CLIENT_ID_PROD' : 'GOOGLE_CLIENT_ID_DEV'] || fallback[isProd ? 'prod' : 'dev'].clientId;
const GOOGLE_CLIENT_SECRET = process.env[isProd ? 'GOOGLE_CLIENT_SECRET_PROD' : 'GOOGLE_CLIENT_SECRET_DEV'] || fallback[isProd ? 'prod' : 'dev'].secret;
const GOOGLE_REDIRECT_URI = process.env[isProd ? 'GOOGLE_REDIRECT_URI_PROD' : 'GOOGLE_REDIRECT_URI_DEV'] || fallback[isProd ? 'prod' : 'dev'].redirect;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// ───────────────────────────────────────────
// REGISTER
// ───────────────────────────────────────────
export const register = async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors.map(e => e.message) });
  }

  const { username, email, password, codeforcesHandle } = result.data;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, codeforcesHandle });

    res.status(201).json({
      message: "User registered successfully",
      user: { username, email, codeforcesHandle }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ───────────────────────────────────────────
// LOGIN
// ───────────────────────────────────────────
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

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

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

// ───────────────────────────────────────────
// GOOGLE LOGIN (Step 1)
// ───────────────────────────────────────────
export const googleLogin = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    redirect_uri: GOOGLE_REDIRECT_URI,
  });

  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID);
  console.log("GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI);

  res.redirect(url);
};

// ───────────────────────────────────────────
// GOOGLE CALLBACK (Step 2)
// ───────────────────────────────────────────
export const googleAuthCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const { email, name, picture } = userInfo.data;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("Please register manually before using Google login.");
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?token=${token}`);
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(500).send("Authentication failed");
  }
};
