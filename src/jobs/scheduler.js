const cron = require('node-cron');
const config = require('../config/env');
const logger = require('../config/logger');
const taskService = require('../services/taskService');
const reminderService = require('../services/reminderService');
const whatsappService = require('../services/whatsappService');
const { User, Task } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class Scheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Scheduler already running');
      return;
    }

    logger.info('Starting scheduler jobs...');

    // Job 1: Check pending reminders every 5 minutes
    const checkRemindersJob = cron.schedule(config.cron.checkTasks, async () => {
      logger.debug('Running: Check pending reminders');
      try {
        await this.checkPendingReminders();
      } catch (error) {
        logger.error('Error in checkPendingReminders job:', error);
      }
    });
    this.jobs.push(checkRemindersJob);

    // Job 2: Send daily summary at 8 AM
    const dailySummaryJob = cron.schedule(config.cron.dailySummary, async () => {
      logger.info('Running: Daily summary');
      try {
        await this.sendDailySummaries();
      } catch (error) {
        logger.error('Error in dailySummary job:', error);
      }
    });
    this.jobs.push(dailySummaryJob);

    // Job 3: Check overdue tasks every hour
    const overdueTasksJob = cron.schedule('0 * * * *', async () => {
      logger.debug('Running: Check overdue tasks');
      try {
        await taskService.checkOverdueTasks();
      } catch (error) {
        logger.error('Error in overdueTasks job:', error);
      }
    });
    this.jobs.push(overdueTasksJob);

    this.isRunning = true;
    logger.info(`Scheduler started with ${this.jobs.length} jobs`);
  }

  async checkPendingReminders() {
    const reminders = await reminderService.getPendingReminders();
    
    logger.info(`Found ${reminders.length} pending reminders`);

    for (const reminder of reminders) {
      try {
        let message = '⏰ *Recordatorio Automático*\n\n';

        if (reminder.Task) {
          message += `📌 *Tarea:* ${reminder.Task.title}\n`;
          
          if (reminder.Task.description) {
            message += `📝 *Descripción:* ${reminder.Task.description}\n`;
          }

          if (reminder.Task.dueAt) {
            const dueTime = moment(reminder.Task.dueAt).tz(reminder.User.timezone);
            const now = moment().tz(reminder.User.timezone);
            const diff = dueTime.diff(now, 'hours');

            message += `⏱️ *Vence en:* ${diff} hora(s)\n`;
            message += `📅 *Fecha:* ${dueTime.format('DD/MM/YYYY HH:mm')}\n`;
          }

          const priorityEmojis = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
          };
          message += `⚡ *Prioridad:* ${priorityEmojis[reminder.Task.priority]} ${reminder.Task.priority}\n`;
        } else {
          message += '📋 Tienes un recordatorio programado.';
        }

        message += '\n💡 Responde "lista" para ver todas tus tareas.';

        // Send WhatsApp message
        await whatsappService.sendMessage(reminder.User.phone, message);
        
        // Mark reminder as sent
        await reminderService.markSent(reminder.id);
        
        logger.info(`Reminder sent to ${reminder.User.phone} for task: ${reminder.Task?.title}`);
      } catch (error) {
        logger.error(`Failed to send reminder ${reminder.id}:`, error);
      }
    }
  }

  async sendDailySummaries() {
    const users = await User.findAll({
      where: { isActive: { [Op.ne]: false } }
    });

    logger.info(`Sending daily summaries to ${users.length} users`);

    for (const user of users) {
      try {
        const today = moment().tz(user.timezone);
        
        // Get today's tasks
        const todayTasks = await Task.findAll({
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

        // Get overdue tasks
        const overdueTasks = await Task.findAll({
          where: {
            userId: user.id,
            status: 'overdue'
          },
          limit: 5
        });

        // Get upcoming tasks (next 3 days)
        const upcomingTasks = await Task.findAll({
          where: {
            userId: user.id,
            status: 'pending',
            dueAt: {
              [Op.between]: [
                today.add(1, 'day').startOf('day').toDate(),
                today.add(3, 'days').endOf('day').toDate()
              ]
            }
          },
          order: [['dueAt', 'ASC']],
          limit: 5
        });

        // Build message
        let message = `☀️ *¡Buenos días ${user.name}!*\n`;
        message += `📅 *${today.format('dddd, DD [de] MMMM')}*\n\n`;

        if (todayTasks.length === 0 && overdueTasks.length === 0) {
          message += '✨ ¡No tienes tareas pendientes para hoy!\n';
          message += 'Disfruta tu día 😊\n';
        } else {
          if (overdueTasks.length > 0) {
            message += '🚨 *Tareas Vencidas:*\n';
            overdueTasks.forEach((task, index) => {
              const dueDate = moment(task.dueAt).tz(user.timezone);
              message += `${index + 1}. ${task.title} (${dueDate.format('DD/MM')})\n`;
            });
            message += '\n';
          }

          if (todayTasks.length > 0) {
            message += `📋 *Tareas para Hoy (${todayTasks.length}):*\n`;
            todayTasks.forEach((task, index) => {
              const dueTime = moment(task.dueAt).tz(user.timezone);
              message += `${index + 1}. ${task.title} - ${dueTime.format('HH:mm')}\n`;
            });
            message += '\n';
          }

          if (upcomingTasks.length > 0) {
            message += '📆 *Próximas Tareas:*\n';
            upcomingTasks.forEach((task) => {
              const dueDate = moment(task.dueAt).tz(user.timezone);
              message += `• ${task.title} (${dueDate.format('DD/MM')})\n`;
            });
          }
        }

        message += '\n💪 *¡Que tengas un excelente día!*';

        // Send message
        await whatsappService.sendMessage(user.phone, message);
        
        logger.info(`Daily summary sent to ${user.phone}`);
      } catch (error) {
        logger.error(`Failed to send daily summary to user ${user.id}:`, error);
      }
    }
  }

  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    logger.info('Stopping scheduler jobs...');
    
    this.jobs.forEach((job, index) => {
      job.stop();
      logger.debug(`Stopped job ${index + 1}`);
    });

    this.jobs = [];
    this.isRunning = false;
    
    logger.info('Scheduler stopped');
  }

  restart() {
    logger.info('Restarting scheduler...');
    this.stop();
    setTimeout(() => this.start(), 1000);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.length,
      jobs: this.jobs.map((job, index) => ({
        id: index,
        running: job.running || false
      }))
    };
  }
}

module.exports = new Scheduler();