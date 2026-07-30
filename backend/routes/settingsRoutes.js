const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getGroupTarget, updateGroupTarget } = require('../controllers/settingsController');

// GET /api/settings/target
router.get('/target', authMiddleware, getGroupTarget);

// PUT /api/settings/target
router.put('/target', authMiddleware, updateGroupTarget);

module.exports = router;
