const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db } = require('../config/firebaseAdmin');

router.post('/', verifyToken, async (req, res) => {
  try {
    const newAppt = {
      ...req.body,
      status: 'pending',
      createdAt: new Date(),
    };
    const docRef = await db.collection('appointments').add(newAppt);
    res.status(201).json({ id: docRef.id, ...newAppt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    await db.collection('appointments').doc(req.params.id).update({
      status,
      notes,
      updatedAt: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
