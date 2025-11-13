// server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- CORS ----------
const allowedOrigins = [
  'http://localhost:5173',          // local dev
  'https://mortgage-poc.vercel.app' // your Vercel frontend
];

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools (Postman, curl) with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Make sure preflight OPTIONS requests work for all routes
app.options('*', cors());

// ---------- Middleware ----------
app.use(express.json());

// ---------- Mongo Connection ----------
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set');
} else {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
}

// ---------- Schemas ----------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const scenarioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  leadId: { type: String },
  clientName: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  campaignDate: { type: String },
  marketingProduct: { type: String },

  mortgageBalance: { type: Number, required: true },
  closingCosts: { type: Number, required: true },
  additionalCash: { type: Number, default: 0 },
  offerRate: { type: Number, required: true },
  offerTerm: { type: Number, required: true },
  currentApr: { type: Number, required: true },
  currentTerm: { type: Number, required: true },

  debts: [
    {
      balance: Number,
      minPayment: Number,
      include: Boolean,
    },
  ],

  estimatedMIP: { type: Number, default: 0.55 },
  estimatedMonthlyTaxes: { type: Number, default: 285.62 },
  estimatedMonthlyInsurance: { type: Number, default: 264.23 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Scenario = mongoose.model('Scenario', scenarioSchema);

// ---------- Auth Middleware ----------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// ---------- Auth Routes ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Scenario Routes ----------
app.get('/api/scenarios', authenticateToken, async (req, res) => {
  try {
    const scenarios = await Scenario.find({ userId: req.user.userId }).sort({
      updatedAt: -1,
    });
    res.json(scenarios);
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/scenarios/:id', authenticateToken, async (req, res) => {
  try {
    const scenario = await Scenario.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    res.json(scenario);
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/scenarios', authenticateToken, async (req, res) => {
  try {
    const scenario = new Scenario({
      ...req.body,
      userId: req.user.userId,
    });

    await scenario.save();
    res.status(201).json(scenario);
  } catch (error) {
    console.error('Create scenario error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/scenarios/:id', authenticateToken, async (req, res) => {
  try {
    const scenario = await Scenario.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    res.json(scenario);
  } catch (error) {
    console.error('Update scenario error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/scenarios/:id', authenticateToken, async (req, res) => {
  try {
    const scenario = await Scenario.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    res.json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    console.error('Delete scenario error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/scenarios/search/:query', authenticateToken, async (req, res) => {
  try {
    const query = req.params.query;
    const scenarios = await Scenario.find({
      userId: req.user.userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { clientName: { $regex: query, $options: 'i' } },
        { propertyAddress: { $regex: query, $options: 'i' } },
        { leadId: { $regex: query, $options: 'i' } },
      ],
    }).sort({ updatedAt: -1 });

    res.json(scenarios);
  } catch (error) {
    console.error('Search scenarios error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Health & Root ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// nice message at "/"
app.get('/', (req, res) => {
  res.send('Loansure API is running');
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;