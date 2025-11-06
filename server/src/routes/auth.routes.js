import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const setAuthCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production (https)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const authMiddleware = (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {}
  next();
};

router.use(authMiddleware);

/** POST /api/auth/register */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, username, password, confirmPassword } = req.body;

    // basic validation
    if (!full_name || !email || !username || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required." });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    // duplicates
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (exists) return res.status(409).json({ message: "Email or username already exists." });

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hash,
    });

    // set cookie + respond
    setAuthCookie(res, { id: user._id, username: user.username });
    res.status(201).json({ id: user._id, full_name: user.full_name, email: user.email, username: user.username });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/** POST /api/auth/login  (username OR email + password) */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email
    if (!identifier || !password) return res.status(400).json({ message: "Missing credentials." });

    const query = identifier.includes("@")
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    setAuthCookie(res, { id: user._id, username: user.username });
    res.json({ id: user._id, full_name: user.full_name, email: user.email, username: user.username });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/** GET /api/auth/me */
router.get("/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated." });
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

/** POST /api/auth/logout */
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ message: "Logged out" });
});

export default router;
