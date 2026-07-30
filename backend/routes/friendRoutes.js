const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { addFriend, removeFriend } = require('../controllers/friendController');

// POST /api/friends/add
router.post('/add', authMiddleware, addFriend);

// DELETE /api/friends/remove/:id
router.delete('/remove/:id', authMiddleware, removeFriend);

module.exports = router;
