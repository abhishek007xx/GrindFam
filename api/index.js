const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../backend/routes/authRoutes');
const dashboardRoutes = require('../backend/routes/dashboardRoutes');
const friendRoutes = require('../backend/routes/friendRoutes');
const settingsRoutes = require('../backend/routes/settingsRoutes');
const activityRoutes = require('../backend/routes/activityRoutes');
const squadRoutes = require('../backend/routes/squadRoutes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/squads', squadRoutes);

app.get('/api', (req, res) => {
  res.json({
    name: 'GrindFam API Server',
    status: 'online',
    version: '1.1.0'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
