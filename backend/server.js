const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const friendRoutes = require('./routes/friendRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activity', activityRoutes);

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GrindFam API Server',
    status: 'online',
    version: '1.1.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 GrindFam Backend Server running on http://localhost:${PORT}`);
});
