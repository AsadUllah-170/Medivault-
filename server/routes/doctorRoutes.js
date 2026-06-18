const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db } = require('../config/firebaseAdmin');

router.get('/', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('doctors').where('status', '==', 'approved').get();
    const doctors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('doctors').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
