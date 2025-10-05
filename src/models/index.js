const sequelize = require('../config/db');
const User = require('./User');
const Task = require('./Task');
const Reminder = require('./Reminder');
const Channel = require('./Channel');
const MessageLog = require('./MessageLog');

// Associations
User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Reminder, { foreignKey: 'userId' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

Task.hasMany(Reminder, { foreignKey: 'taskId' });
Reminder.belongsTo(Task, { foreignKey: 'taskId' });

User.hasMany(Channel, { foreignKey: 'userId' });
Channel.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MessageLog, { foreignKey: 'userId' });
MessageLog.belongsTo(User, { foreignKey: 'userId' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database sync error:', error);
  }
};

if (require.main === module) {
  syncDatabase();
}

module.exports = {
  sequelize,
  User,
  Task,
  Reminder,
  Channel,
  MessageLog,
  syncDatabase
};