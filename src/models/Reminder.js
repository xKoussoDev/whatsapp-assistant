const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  taskId: {
    type: DataTypes.UUID,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  remindAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('whatsapp', 'email'),
    defaultValue: 'whatsapp'
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sentAt: {
    type: DataTypes.DATE
  }
});

module.exports = Reminder;