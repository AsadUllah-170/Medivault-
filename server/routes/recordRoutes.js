const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db } = require('../config/firebaseAdmin');

router.post('/', verifyToken, async (req, res) => {
  try {
    const newRecord = {
      ...req.body,
      createdAt: new Date(),
    };
    const docRef = await db.collection('records').add(newRecord);
    res.status(201).json({ id: docRef.id, ...newRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('records').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Record not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
