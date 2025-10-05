const taskService = require('../services/taskService');
const nlpService = require('../services/nlpService');
const reminderService = require('../services/reminderService');
const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(''),
  text: Joi.string(),
  dueAt: Joi.date().iso(),
  priority: Joi.string().valid('low', 'medium', 'high')
}).or('title', 'text');

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    let taskData = value;
    
    // If text provided, process with NLP
    if (value.text) {
      const nlpResult = nlpService.processMessage(value.text);
      taskData = {
        title: nlpResult.entities.title || 'Nueva tarea',
        dueAt: nlpResult.entities.dueAt,
        priority: nlpResult.entities.priority,
        rawInput: value.text,
        nlpIntent: nlpResult.intent,
        nlpEntities: nlpResult.entities
      };
    }
    
    const task = await taskService.createTask(req.user.id, taskData);
    
    // Create reminders
    await reminderService.createTaskReminders(task);
    
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const tasks = await taskService.listTasks(req.user.id, { status, date });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const task = await taskService.getTask(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    const task = await taskService.updateTask(req.params.id, req.user.id, updates);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};