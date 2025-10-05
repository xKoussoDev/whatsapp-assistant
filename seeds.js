require('dotenv').config();
const { User, Task, Reminder } = require('./src/models');
const logger = require('./src/config/logger');
const moment = require('moment-timezone');

async function runSeeds() {
  try {
    await require('./src/models').syncDatabase();
    
    // Create demo user
    const user = await User.findOrCreate({
      where: { phone: '+521234567890' },
      defaults: {
        name: 'Pablo',
        password: 'demo123',
        timezone: 'America/Mexico_City'
      }
    });
    
    logger.info('Demo user created:', user[0].phone);
    
    // Create sample tasks
    const tasks = [
      {
        userId: user[0].id,
        title: 'Revisar correos',
        description: 'Revisar y responder correos importantes',
        dueAt: moment().add(2, 'hours').toDate(),
        priority: 'high',
        status: 'pending'
      },
      {
        userId: user[0].id,
        title: 'Reunión con equipo',
        description: 'Reunión semanal de sincronización',
        dueAt: moment().add(1, 'day').hour(10).minute(0).toDate(),
        priority: 'medium',
        status: 'pending'
      },
      {
        userId: user[0].id,
        title: 'Estudiar IA',
        description: 'Completar módulo 3 del curso',
        dueAt: moment().add(2, 'days').hour(18).minute(0).toDate(),
        priority: 'medium',
        status: 'pending'
      }
    ];
    
    for (const taskData of tasks) {
      const task = await Task.create(taskData);
      logger.info('Task created:', task.title);
      
      // Create reminder
      if (task.dueAt) {
        await Reminder.create({
          userId: user[0].id,
          taskId: task.id,
          remindAt: moment(task.dueAt).subtract(30, 'minutes').toDate(),
          channel: 'whatsapp'
        });
      }
    }
    
    logger.info('Seeds completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeds error:', error);
    process.exit(1);
  }
}

runSeeds();