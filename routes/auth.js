// routers/auth.js
const express = require('express');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Render Login page
router.get('/login', (req, res) => {
  const message = req.query.message || null;
  res.render('login', { error: null, message });
});

// Render Sign Up page
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.redirect('/auth/login'); // Redirect to login page
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).render('login', { error: 'Email and password are required', message: null });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Use generic error message for security (don't reveal if email exists)
      return res.status(401).render('login', { error: 'Invalid email or password', message: null });
    }

    // Use the comparePassword method from the user model
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      // Use same generic error message
      return res.status(401).render('login', { error: 'Invalid email or password', message: null });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('User authenticated successfully:', email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).render('login', { error: 'Server error, please try again later', message: null });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Signup request received for email:', email);

    if (!email || !password) {
      return res.status(400).render('signup', { error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('signup', { error: 'Email is already registered' });
    }

    if (password.length < 8) {
      return res.status(400).render('signup', { error: 'Password must be at least 8 characters long' });
    }

    // Create the user with plaintext password - the model's pre-save hook will hash it
    const user = new User({ email, password });
    await user.save();
    console.log('User registered successfully:', email);

    res.redirect('/auth/login?message=Account created successfully! Please log in.');
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).render('signup', { error: 'Server error, please try again later' });
  }
});

module.exports = router;