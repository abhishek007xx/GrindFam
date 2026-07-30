const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const supabase = require('../config/supabaseClient');

/**
 * POST /api/auth/me
 * Get user profile from Supabase using the auth token
 */
router.post('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile from `profiles` table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        user: req.user,
        profile: null,
        message: 'Profile not populated in profiles table yet.'
      });
    }

    return res.json({
      user: req.user,
      profile
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
