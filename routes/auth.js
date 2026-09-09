const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many attempts, try again in a few minutes' },
});

function signToken(user) {
  return jwt.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

router.post('/register', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  if (password.length < 8) {
    return res.status(400).json({ msg: 'Password must be at least 8 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = signToken(user);

    return res.status(201).json({
      msg: 'Registration successful',
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Username already taken' });
    }
    return res.status(500).json({ msg: 'Something went wrong, try again' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      msg: 'Login successful',
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Something went wrong, try again' });
  }
});

router.post('/guest', authLimiter, (req, res) => {
  const guestId = new mongoose.Types.ObjectId();
  const guestUsername = `Guest${Math.floor(100000 + Math.random() * 900000)}`;
  const token = signToken({ _id: guestId, username: guestUsername });

  return res.json({
    msg: 'Guest session started',
    token,
    userId: guestId,
    username: guestUsername,
  });
});

module.exports = router;
