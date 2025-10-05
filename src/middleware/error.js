const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.errors[0].message
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};