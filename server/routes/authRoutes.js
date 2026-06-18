const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db, auth } = require('../config/firebaseAdmin');

// Auth: POST /api/auth/register is handled by frontend Firebase SDK
// This is a placeholder for custom backend logic if needed
router.post('/register', async (req, res) => {
  res.status(200).json({ message: 'Registration is handled client-side via Firebase Auth.' });
});

module.exports = router;
