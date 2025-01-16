const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const prisma = require('../prismaClient');

const router = express.Router();

// Home route
router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
    });

    res.render('home', { user: req.user, files });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('An error occurred while fetching your files.');
  }
});
// Login route
router.get('/login', (req, res) => res.render('login'));
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',       // Redirect to the dashboard or home page after successful login
  failureRedirect: '/login',  // Redirect back to the login page on failure
  failureFlash: true,         // Enable error messages
}));
// Register route
router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  res.redirect('/login');
});
// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});
// Dashboard route
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('dashboard', { user: req.user });
});

module.exports = router;
