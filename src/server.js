require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/env');
const logger = require('./config/logger');
const { syncDatabase } = require('./models');
const scheduler = require('./jobs/scheduler');
const healthPing = require('./jobs/healthPing');

const PORT = config.port;

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/webhook', require('./routes/webhookRoutes'));
app.use('/docs', require('./routes/docsRoutes'));

// Error handler
app.use(require('./middleware/error'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    // Sync database
    await syncDatabase();
    
    // Start scheduler
    scheduler.start();
    
    // Start health ping
    healthPing.start();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Webhook URL: ${config.app.baseUrl}/webhook/whatsapp`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      scheduler.stop();
      healthPing.stop();
      server.close(() => {
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
