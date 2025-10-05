const axios = require('axios');
const config = require('../config/env');
const logger = require('../config/logger');
const cron = require('node-cron');

class HealthPing {
  constructor() {
    this.job = null;
    this.isRunning = false;
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      lastPingTime: null,
      lastPingStatus: null
    };
  }

  start() {
    if (this.isRunning) {
      logger.warn('Health ping already running');
      return;
    }

    if (!config.healthPingUrl) {
      logger.info('Health ping URL not configured, skipping health ping job');
      return;
    }

    logger.info(`Starting health ping to ${config.healthPingUrl}`);

    // Schedule health ping based on cron expression
    this.job = cron.schedule(config.cron.healthPing, async () => {
      await this.ping();
    });

    this.isRunning = true;
    logger.info('Health ping job started');
    
    // Do an immediate ping on start
    this.ping();
  }

  async ping() {
    const startTime = Date.now();
    
    try {
      logger.debug('Sending health ping...');
      
      const response = await axios.get(config.healthPingUrl, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'WhatsApp-Assistant-HealthCheck/1.0'
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        this.stats.successfulPings++;
        this.stats.lastPingStatus = 'success';
        
        logger.debug(`Health ping successful (${responseTime}ms)`);
      } else {
        this.stats.failedPings++;
        this.stats.lastPingStatus = 'failed';
        
        logger.warn(`Health ping returned status ${response.status}`);
      }

      this.stats.totalPings++;
      this.stats.lastPingTime = new Date();
      this.stats.lastResponseTime = responseTime;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.stats.failedPings++;
      this.stats.totalPings++;
      this.stats.lastPingStatus = 'error';
      this.stats.lastPingTime = new Date();
      this.stats.lastResponseTime = responseTime;
      this.stats.lastError = error.message;

      logger.error('Health ping failed:', {
        error: error.message,
        url: config.healthPingUrl,
        responseTime
      });

      // If too many consecutive failures, alert
      if (this.stats.failedPings > 5 && this.stats.failedPings % 5 === 0) {
        logger.error(`ALERT: ${this.stats.failedPings} consecutive health ping failures!`);
        // Here you could send an alert via email, Slack, etc.
        await this.sendAlert();
      }
    }
  }

  async sendAlert() {
    // This is where you'd implement alerting logic
    // For example, send a WhatsApp message to admin
    try {
      const { User } = require('../models');
      const whatsappService = require('../services/whatsappService');
      
      const admins = await User.findAll({
        where: { isAdmin: true }
      });

      for (const admin of admins) {
        const message = `🚨 *ALERTA DEL SISTEMA*\n\n` +
          `El servicio de health check está fallando.\n` +
          `Fallos consecutivos: ${this.stats.failedPings}\n` +
          `Último error: ${this.stats.lastError}\n` +
          `URL: ${config.healthPingUrl}`;
        
        await whatsappService.sendMessage(admin.phone, message);
      }
    } catch (error) {
      logger.error('Failed to send health ping alert:', error);
    }
  }

  stop() {
    if (!this.isRunning) {
      logger.warn('Health ping is not running');
      return;
    }

    if (this.job) {
      this.job.stop();
      this.job = null;
    }

    this.isRunning = false;
    logger.info('Health ping job stopped');
  }

  restart() {
    logger.info('Restarting health ping...');
    this.stop();
    setTimeout(() => this.start(), 1000);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      url: config.healthPingUrl,
      stats: {
        ...this.stats,
        uptime: this.stats.totalPings > 0 
          ? ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(2) + '%'
          : 'N/A'
      }
    };
  }

  // Method to manually trigger a health check
  async check() {
    if (!config.healthPingUrl) {
      return {
        status: 'error',
        message: 'Health ping URL not configured'
      };
    }

    await this.ping();
    return this.getStatus();
  }
}

module.exports = new HealthPing();