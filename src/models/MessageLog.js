const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MessageLog = sequelize.define('MessageLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  direction: {
    type: DataTypes.ENUM('in', 'out'),
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('whatsapp', 'email'),
    defaultValue: 'whatsapp'
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false
  }
});

module.exports = MessageLog;