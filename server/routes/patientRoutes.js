const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db } = require('../config/firebaseAdmin');

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('patients').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Patient not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/records', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('records').where('patientId', '==', req.params.id).get();
    const records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
