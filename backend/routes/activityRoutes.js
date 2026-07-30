const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getHeatmapData } = require('../controllers/activityController');

// GET /api/activity/heatmap
router.get('/heatmap', authMiddleware, getHeatmapData);

module.exports = router;
