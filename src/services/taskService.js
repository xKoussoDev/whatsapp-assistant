const { Task, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class TaskService {
  async createTask(userId, data) {
    return Task.create({
      userId,
      title: data.title,
      description: data.description,
      dueAt: data.dueAt,
      priority: data.priority || 'medium',
      rawInput: data.rawInput,
      nlpIntent: data.nlpIntent,
      nlpEntities: data.nlpEntities
    });
  }

  async listTasks(userId, options = {}) {
    const where = { userId };
    
    if (options.status) {
      where.status = options.status;
    }
    
    if (options.date) {
      const startOfDay = moment(options.date).startOf('day').toDate();
      const endOfDay = moment(options.date).endOf('day').toDate();
      where.dueAt = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }
    
    return Task.findAll({
      where,
      order: [['dueAt', 'ASC'], ['priority', 'DESC']]
    });
  }

  async getTask(taskId, userId) {
    return Task.findOne({
      where: { id: taskId, userId }
    });
  }

  async updateTask(taskId, userId, data) {
    const task = await this.getTask(taskId, userId);
    if (!task) throw new Error('Task not found');
    
    return task.update(data);
  }

  async deleteTask(taskId, userId) {
    const task = await this.getTask(taskId, userId);
    if (!task) throw new Error('Task not found');
    
    await task.destroy();
    return true;
  }

  async markComplete(taskId, userId) {
    return this.updateTask(taskId, userId, { status: 'done' });
  }

  async checkOverdueTasks() {
    const now = new Date();
    await Task.update(
      { status: 'overdue' },
      {
        where: {
          dueAt: { [Op.lt]: now },
          status: 'pending'
        }
      }
    );
  }
}

module.exports = new TaskService();