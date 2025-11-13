// server.js - Express + MongoDB Backend API

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (FIXED - removed deprecated options)
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Scenario Schema
const scenarioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  leadId: { type: String },
  clientName: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  campaignDate: { type: String },
  marketingProduct: { type: String },
  
  // Financial Data
  mortgageBalance: { type: Number, required: true },
  closingCosts: { type: Number, required: true },
  additionalCash: { type: Number, default: 0 },
  offerRate: { type: Number, required: true },
  offerTerm: { type: Number, required: true },
  currentApr: { type: Number, required: true },
  currentTerm: { type: Number, required: true },
  
  // Debts
  debts: [{
    balance: Number,
    minPayment: Number,
    include: Boolean,
  }],
  
  // Estimates
  estimatedMIP: { type: Number, default: 0.55 },
  estimatedMonthlyTaxes: { type: Number, default: 285.62 },
  estimatedMonthlyInsurance: { type: Number, default: 264.23 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Scenario = mongoose.model('Scenario', scenarioSchema);

// ==================== AUTH MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SCENARIO ROUTES ====================

// Get all scenarios for user
app.get('/api/scenarios', authenticateToken, async (req, res) => {
  try {
    const scenarios = await Scenario.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
    res.json(scenarios);
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single scenario
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

// Create scenario
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

// Update scenario
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

// Delete scenario
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

// Search scenarios
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

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;