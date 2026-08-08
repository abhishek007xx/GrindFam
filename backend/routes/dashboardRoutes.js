const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getDashboardData, syncLeetCodeData, getGlobalLeaderboard } = require('../controllers/dashboardController');

// GET /api/dashboard
router.get('/', authMiddleware, getDashboardData);

// GET /api/dashboard/global-leaderboard
router.get('/global-leaderboard', authMiddleware, getGlobalLeaderboard);

// POST /api/dashboard/sync — Manual force sync LeetCode data
router.post('/sync', authMiddleware, syncLeetCodeData);

module.exports = router;
