import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ======================================
// 🚀 CORS CONFIG — THIS FIXES YOUR ERROR
// ======================================
const allowedOrigins = [
  process.env.FRONTEND_URL,       // You will set this in Render Dashboard
  "http://localhost:5173",        // Local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ BLOCKED BY CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

// Needed to read JSON
app.use(express.json());

// ======================================
// 🚀 CONNECT TO MONGO
// ======================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ======================================
// 📌 USER MODEL
// ======================================
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// ======================================
// 📌 SCENARIO MODEL
// ======================================
const scenarioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  leadId: String,
  clientName: String,
  propertyAddress: String,
  campaignDate: String,
  marketingProduct: String,
  mortgageBalance: Number,
  closingCosts: Number,
  additionalCash: Number,
  offerRate: Number,
  offerTerm: Number,
  currentApr: Number,
  currentTerm: Number,
  debts: [
    {
      balance: Number,
      minPayment: Number,
      include: Boolean,
    },
  ],
  estimatedMIP: Number,
  estimatedMonthlyTaxes: Number,
  estimatedMonthlyInsurance: Number,
});
const Scenario = mongoose.model("Scenario", scenarioSchema);

// ======================================
// 🔐 AUTH MIDDLEWARE
// ======================================
const authenticateToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// ======================================
// 🔐 REGISTER
// ======================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashed, name });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================
// 🔐 LOGIN
// ======================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================
// 📌 SCENARIO ROUTES
// ======================================
app.get("/api/scenarios", authenticateToken, async (req, res) => {
  const scenarios = await Scenario.find({ userId: req.user.userId });
  res.json(scenarios);
});

app.post("/api/scenarios", authenticateToken, async (req, res) => {
  const scenario = new Scenario({ ...req.body, userId: req.user.userId });
  await scenario.save();
  res.json(scenario);
});

// ======================================
// 🔍 HEALTH CHECK
// ======================================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ======================================
// 🚀 START SERVER
// ======================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});