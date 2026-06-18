const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db, auth } = require('../config/firebaseAdmin');

// Middleware to check if admin
const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (userDoc.exists && userDoc.data().role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [patients, doctors, appointments, records] = await Promise.all([
      db.collection('users').where('role', '==', 'patient').count().get(),
      db.collection('users').where('role', '==', 'doctor').count().get(),
      db.collection('appointments').count().get(),
      db.collection('records').count().get(),
    ]);

    res.json({
      totalPatients: patients.data().count,
      totalDoctors: doctors.data().count,
      totalAppointments: appointments.data().count,
      totalRecords: records.data().count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
