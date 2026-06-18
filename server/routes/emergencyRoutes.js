const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');

// NO verifyToken middleware here. This is public.
router.get('/:patientId', async (req, res) => {
  try {
    const doc = await db.collection('patients').doc(req.params.patientId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Emergency profile not found' });
    }
    
    // Only return safe public info
    const data = doc.data();
    const publicData = {
      personalInfo: data.personalInfo,
      allergies: data.allergies,
      chronicConditions: data.chronicConditions,
      currentMedications: data.currentMedications,
      emergencyContacts: data.emergencyContacts,
    };
    
    res.json(publicData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
