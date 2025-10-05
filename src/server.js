require('dotenv').config();
const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');
const { syncDatabase } = require('./models');
const scheduler = require('./jobs/scheduler');
const healthPing = require('./jobs/healthPing');  // ← Agregar esta línea

const PORT = config.port;

async function startServer() {
  try {
    // Sync database
    await syncDatabase();
    
    // Start scheduler
    scheduler.start();
    
    // Start health ping
    healthPing.start();  // ← Agregar esta línea
    
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
      healthPing.stop();  // ← Agregar esta línea
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