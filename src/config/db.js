const { Sequelize } = require('sequelize');
const config = require('./env');
const logger = require('./logger');

let sequelize;

if (config.env === 'production' && config.db.url) {
  sequelize = new Sequelize(config.db.url, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.sqlite,
    logging: false
  });
}

sequelize.authenticate()
  .then(() => logger.info('Database connected'))
  .catch(err => logger.error('Database connection error:', err));

module.exports = sequelize;