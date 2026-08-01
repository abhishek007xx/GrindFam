const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createSquad,
  joinSquad,
  leaveSquad,
  getSquadDetails
} = require('../controllers/squadController');

router.use(authMiddleware);

router.post('/create', createSquad);
router.post('/join', joinSquad);
router.post('/leave', leaveSquad);
router.get('/current', getSquadDetails);

module.exports = router;
