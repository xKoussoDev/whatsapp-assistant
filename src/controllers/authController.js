const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/env');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(6).required(),
  timezone: Joi.string().default('America/Mexico_City')
});

const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  password: Joi.string().required()
});

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const existingUser = await User.findOne({ where: { phone: value.phone } });
    if (existingUser) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }
    
    const user = await User.create(value);
    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expires
    });
    
    res.status(201).json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const user = await User.findOne({ where: { phone: value.phone } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await user.comparePassword(value.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expires
    });
    
    res.json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};