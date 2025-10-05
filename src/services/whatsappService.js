const whatsappClient = require('../config/whatsapp');
const { MessageLog, User, Channel } = require('../models');
const nlpService = require('./nlpService');
const taskService = require('./taskService');
const intents = require('../nlp/intents');
const logger = require('../config/logger');

class WhatsAppService {
  async handleIncomingMessage(data) {
    try {
      const from = data.from;
      const text = data.text?.body;
      const messageId = data.id;
      
      if (!text) return;
      
      // Find or create user
      let user = await User.findOne({ where: { phone: from } });
      if (!user) {
        user = await User.create({
          name: data.profile?.name || 'Usuario',
          phone: from,
          password: 'temp-' + Math.random().toString(36).slice(-8)
        });
        
        await Channel.create({
          userId: user.id,
          type: 'whatsapp',
          address: from,
          verified: true
        });
      }
      
      // Log incoming message
      await MessageLog.create({
        userId: user.id,
        direction: 'in',
        channel: 'whatsapp',
        payload: data
      });
      
      // Process with NLP
      const nlpResult = nlpService.processMessage(text);
      
      // Handle based on intent
      const response = await this.processIntent(user, nlpResult);
      
      // Send response
      await this.sendMessage(from, response);
      
      // Mark as read
      await whatsappClient.markAsRead(messageId);
      
    } catch (error) {
      logger.error('Error handling WhatsApp message:', error);
    }
  }
  
  async processIntent(user, nlpResult) {
    const { intent, entities } = nlpResult;
    
    switch (intent) {
      case intents.CREATE_TASK:
        return this.handleCreateTask(user, entities, nlpResult);
        
      case intents.LIST_TASKS:
        return this.handleListTasks(user, entities);
        
      case intents.COMPLETE_TASK:
        return this.handleCompleteTask(user, entities);
        
      case intents.DELETE_TASK:
        return this.handleDeleteTask(user, entities);
        
      case intents.HELP:
        return this.getHelpMessage();
        
      case intents.GREETING:
        return `¡Hola ${user.name}! 👋 ¿En qué puedo ayudarte hoy?`;
        
      default:
        return 'No entendí tu mensaje. Escribe "ayuda" para ver qué puedo hacer.';
    }
  }
  
  async handleCreateTask(user, entities, nlpResult) {
    try {
      if (!entities.title || entities.title === 'Tarea sin título') {
        return '❓ Por favor, dime qué tarea quieres crear. Ejemplo: "Recuérdame estudiar IA mañana a las 6pm"';
      }
      
      const task = await taskService.createTask(user.id, {
        title: entities.title,
        dueAt: entities.dueAt,
        priority: entities.priority,
        rawInput: nlpResult.originalText,
        nlpIntent: nlpResult.intent,
        nlpEntities: entities
      });
      
      // Create automatic reminders
      const reminderService = require('./reminderService');
      await reminderService.createTaskReminders(task);
      
      let response = `✅ Tarea creada: "${task.title}"`;
      if (task.dueAt) {
        const moment = require('moment-timezone');
        response += `\n📅 Fecha: ${moment(task.dueAt).tz(user.timezone).format('DD/MM/YYYY HH:mm')}`;
      }
      response += `\n⚡ Prioridad: ${this.translatePriority(task.priority)}`;
      
      return response;
    } catch (error) {
      logger.error('Error creating task:', error);
      return '❌ Hubo un error al crear la tarea. Por favor intenta de nuevo.';
    }
  }
  
  async handleListTasks(user, entities) {
    try {
      const tasks = await taskService.listTasks(user.id, {
        status: 'pending',
        date: entities.date
      });
      
      if (tasks.length === 0) {
        return '📭 No tienes tareas pendientes.';
      }
      
      let response = '📋 *Tus tareas pendientes:*\n\n';
      const moment = require('moment-timezone');
      
      tasks.forEach((task, index) => {
        response += `${index + 1}. ${task.title}`;
        if (task.dueAt) {
          response += ` - ${moment(task.dueAt).tz(user.timezone).format('DD/MM HH:mm')}`;
        }
        response += ` [${this.translatePriority(task.priority)}]\n`;
      });
      
      response += '\n💡 Escribe "completar 1" para marcar la primera como hecha.';
      
      return response;
    } catch (error) {
      logger.error('Error listing tasks:', error);
      return '❌ Error al obtener las tareas.';
    }
  }
  
  async handleCompleteTask(user, entities) {
    try {
      if (!entities.taskNumber) {
        return '❓ Por favor indica el número de la tarea. Ejemplo: "completar 2"';
      }
      
      const tasks = await taskService.listTasks(user.id, { status: 'pending' });
      const taskIndex = entities.taskNumber - 1;
      
      if (taskIndex < 0 || taskIndex >= tasks.length) {
        return `❌ No existe la tarea #${entities.taskNumber}. Tienes ${tasks.length} tareas pendientes.`;
      }
      
      const task = tasks[taskIndex];
      await taskService.markComplete(task.id, user.id);
      
      return `✅ Tarea completada: "${task.title}"`;
    } catch (error) {
      logger.error('Error completing task:', error);
      return '❌ Error al completar la tarea.';
    }
  }
  
  async handleDeleteTask(user, entities) {
    try {
      if (!entities.taskNumber) {
        return '❓ Por favor indica el número de la tarea a eliminar. Ejemplo: "borrar 3"';
      }
      
      const tasks = await taskService.listTasks(user.id, { status: 'pending' });
      const taskIndex = entities.taskNumber - 1;
      
      if (taskIndex < 0 || taskIndex >= tasks.length) {
        return `❌ No existe la tarea #${entities.taskNumber}`;
      }
      
      const task = tasks[taskIndex];
      await taskService.deleteTask(task.id, user.id);
      
      return `🗑️ Tarea eliminada: "${task.title}"`;
    } catch (error) {
      logger.error('Error deleting task:', error);
      return '❌ Error al eliminar la tarea.';
    }
  }
  
  getHelpMessage() {
    return `🤖 *Asistente Personal 24/7*

Puedo ayudarte con:

📝 *Crear tareas:*
"Recuérdame estudiar IA mañana a las 6pm"
"Tengo que comprar leche urgente"

📋 *Ver tareas:*
"Lista mis tareas"
"Qué tengo pendiente hoy"

✅ *Completar tareas:*
"Completar 1"
"Marca como hecha la 2"

🗑️ *Eliminar tareas:*
"Borrar tarea 3"
"Eliminar la 1"

⏰ Recibirás recordatorios automáticos antes de cada fecha límite.`;
  }
  
  translatePriority(priority) {
    const priorities = {
      high: '🔴 Alta',
      medium: '🟡 Media',
      low: '🟢 Baja'
    };
    return priorities[priority] || priority;
  }
  
  async sendMessage(to, text) {
    try {
      await whatsappClient.sendMessage(to, text);
      
      // Log outgoing message
      const user = await User.findOne({ where: { phone: to } });
      if (user) {
        await MessageLog.create({
          userId: user.id,
          direction: 'out',
          channel: 'whatsapp',
          payload: { text, to }
        });
      }
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
    }
  }
}

module.exports = new WhatsAppService();