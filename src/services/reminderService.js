const { Reminder, Task, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class ReminderService {
  async createReminder(userId, data) {
    return Reminder.create({
      userId,
      taskId: data.taskId,
      remindAt: data.remindAt,
      channel: data.channel || 'whatsapp'
    });
  }

  async getPendingReminders() {
    const now = new Date();
    return Reminder.findAll({
      where: {
        sent: false,
        remindAt: { [Op.lte]: now }
      },
      include: [
        {
          model: Task,
          required: false
        },
        {
          model: User,
          required: true
        }
      ]
    });
  }

  async markSent(reminderId) {
    const reminder = await Reminder.findByPk(reminderId);
    if (reminder) {
      await reminder.update({
        sent: true,
        sentAt: new Date()
      });
    }
  }

  async createTaskReminders(task) {
    const reminders = [];
    
    if (task.dueAt) {
      // Reminder 1 hour before
      const oneHourBefore = moment(task.dueAt).subtract(1, 'hour').toDate();
      if (oneHourBefore > new Date()) {
        reminders.push({
          userId: task.userId,
          taskId: task.id,
          remindAt: oneHourBefore
        });
      }
      
      // Reminder 1 day before
      const oneDayBefore = moment(task.dueAt).subtract(1, 'day').toDate();
      if (oneDayBefore > new Date()) {
        reminders.push({
          userId: task.userId,
          taskId: task.id,
          remindAt: oneDayBefore
        });
      }
    }
    
    return Promise.all(reminders.map(r => this.createReminder(task.userId, r)));
  }
}

module.exports = new ReminderService();