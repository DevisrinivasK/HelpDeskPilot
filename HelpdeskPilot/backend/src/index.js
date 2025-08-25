const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const winston = require('winston');
const authRoutes = require('./routes/auth');
const kbRoutes = require('./routes/kb');
const ticketRoutes = require('./routes/ticket');
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.Console()
  ]
});

// Middleware for request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Auth routes
app.use('/api/auth', authRoutes);

// KB routes
app.use('/api/kb', kbRoutes);

// Ticket routes
app.use('/api/ticket', ticketRoutes);

// Health check endpoint
app.get('/healthz', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'healthy', mongodb: 'connected' });
  } catch (error) {
    logger.error('MongoDB health check failed', { error });
    res.status(500).json({ status: 'unhealthy', mongodb: 'disconnected' });
  }
});

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  }
};

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  await connectWithRetry();
});

module.exports = app; // Export for testing if needed