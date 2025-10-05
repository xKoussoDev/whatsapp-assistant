const reminderService = require('../services/reminderService');
const Joi = require('joi');

const createReminderSchema = Joi.object({
  taskId: Joi.string().uuid(),
  remindAt: Joi.date().iso().required(),
  channel: Joi.string().valid('whatsapp', 'email').default('whatsapp')
});

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createReminderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const reminder = await reminderService.createReminder(req.user.id, value);
    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { Reminder } = require('../models');
    const reminders = await Reminder.findAll({
      where: { userId: req.user.id },
      order: [['remindAt', 'ASC']]
    });
    res.json(reminders);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { Reminder } = require('../models');
    const reminder = await Reminder.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    
    await reminder.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};