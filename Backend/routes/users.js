const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path as needed

// Get users by IDs
router.post('/getByIds', async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }

    const users = await User.find({ 
      _id: { $in: userIds } 
    }).select('-password -refreshToken'); // Exclude sensitive data
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by IDs:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
