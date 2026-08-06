const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createSquad, joinSquad, leaveSquad, getSquadDetails,
  getMessages, sendMessage,
  getSnippets, createSnippet,
  getSnippetComments, addSnippetComment,
  getWeeklyChallenge, voteWeeklyChallenge,
  postStandup, getLeaderboard,
  reportMember, muteMember, kickMember
} = require('../controllers/squadController');

router.use(authMiddleware);

// Core squad operations
router.post('/create', createSquad);
router.post('/join', joinSquad);
router.post('/leave', leaveSquad);
router.get('/current', getSquadDetails);

// Real-time chat
router.get('/messages', getMessages);
router.post('/messages', sendMessage);

// Code snippet sharing & peer review
router.get('/snippets', getSnippets);
router.post('/snippets', createSnippet);
router.get('/snippets/:id/comments', getSnippetComments);
router.post('/snippets/:id/comments', addSnippetComment);

// Weekly challenges
router.get('/weekly-challenge', getWeeklyChallenge);
router.post('/weekly-challenge/vote', voteWeeklyChallenge);

// Daily standup
router.post('/standup', postStandup);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Anti-toxicity & moderation
router.post('/report', reportMember);
router.post('/mute/:userId', muteMember);
router.post('/kick/:userId', kickMember);

module.exports = router;
