const cron = require('node-cron');
const config = require('../config/env');
const logger = require('../config/logger');
const { Task, User, Reminder } = require('../models');
const reminderService = require('./reminderService');
const whatsappService = require('./whatsappService');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

class ScheduleService {
  constructor() {
    this.jobs = [];
  }
  
  start() {
    logger.info('Starting scheduler service...');
    
    // Check for pending reminders
    this.jobs.push(
      cron.schedule(config.cron.checkTasks, async () => {
        await this.checkPendingReminders();
      })
    );
    
    // Send daily summary
    this.jobs.push(
      cron.schedule(config.cron.dailySummary, async () => {
        await this.sendDailySummaries();
      })
    );
    
    // Health ping
    if (config.healthPingUrl) {
      this.jobs.push(
        cron.schedule(config.cron.healthPing, async () => {
          await this.healthPing();
        })
      );
    }
    
    logger.info('Scheduler service started');
  }
  
  async checkPendingReminders() {
    try {
      const reminders = await reminderService.getPendingReminders();
      
      for (const reminder of reminders) {
        let message = '⏰ *Recordatorio:*\n\n';
        
        if (reminder.Task) {
          message += `📌 ${reminder.Task.title}\n`;
          if (reminder.Task.dueAt) {
            const dueTime = moment(reminder.Task.dueAt).tz(reminder.User.timezone);
            message += `📅 Vence: ${dueTime.format('DD/MM/YYYY HH:mm')}\n`;
          }
          message += `⚡ Prioridad: ${this.translatePriority(reminder.Task.priority)}`;
        } else {
          message += 'Tienes un recordatorio programado.';
        }
        
        await whatsappService.sendMessage(reminder.User.phone, message);
        await reminderService.markSent(reminder.id);
      }
    } catch (error) {
      logger.error('Error checking reminders:', error);
    }
  }
  
  async sendDailySummaries() {
    try {
      const users = await User.findAll();
      
      for (const user of users) {
        const today = moment().tz(user.timezone);
        const tasks = await Task.findAll({
          where: {
            userId: user.id,
            status: 'pending',
            dueAt: {
              [Op.between]: [
                today.startOf('day').toDate(),
                today.endOf('day').toDate()
              ]
            }
          },
          order: [['dueAt', 'ASC']]
        });
        
        if (tasks.length > 0) {
          let message = `☀️ *Buenos días ${user.name}!*\n\n`;
          message += `📅 Tienes ${tasks.length} tarea(s) para hoy:\n\n`;
          
          tasks.forEach((task, index) => {
            const dueTime = moment(task.dueAt).tz(user.timezone);
            message += `${index + 1}. ${task.title} - ${dueTime.format('HH:mm')}\n`;
          });
          
          message += '\n¡Que tengas un excelente día! 💪';
          
          await whatsappService.sendMessage(user.phone, message);
        }
      }
    } catch (error) {
      logger.error('Error sending daily summaries:', error);
    }
  }
  
  async healthPing() {
    try {
      const axios = require('axios');
      await axios.get(config.healthPingUrl);
      logger.debug('Health ping sent');
    } catch (error) {
      logger.error('Health ping failed:', error.message);
    }
  }
  
  translatePriority(priority) {
    const priorities = {
      high: '🔴 Alta',
      medium: '🟡 Media',
      low: '🟢 Baja'
    };
    return priorities[priority] || priority;
  }
  
  stop() {
    this.jobs.forEach(job => job.stop());
    logger.info('Scheduler service stopped');
  }
}

module.exports = new ScheduleService();