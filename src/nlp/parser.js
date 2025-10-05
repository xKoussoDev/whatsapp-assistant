const chrono = require('chrono-node');
const moment = require('moment-timezone');
const config = require('../config/env');

class Parser {
  constructor() {
    this.timezone = config.app.timezone;
  }

  extractDate(text) {
    const parsed = chrono.parseDate(text, new Date(), {
      timezone: this.timezone
    });
    return parsed;
  }

  extractPriority(text) {
    const priorities = {
      'urgente': 'high',
      'importante': 'high',
      'alta': 'high',
      'media': 'medium',
      'normal': 'medium',
      'baja': 'low',
      'cuando pueda': 'low'
    };

    const lowerText = text.toLowerCase();
    for (const [keyword, priority] of Object.entries(priorities)) {
      if (lowerText.includes(keyword)) {
        return priority;
      }
    }
    return 'medium';
  }

  extractTaskNumber(text) {
    const match = text.match(/\b(\d+)\b/);
    return match ? parseInt(match[1]) : null;
  }

  extractTitle(text) {
    // Remove common action words and time references
    let title = text
      .replace(/^(recuérdame|recordarme|crear tarea|agregar tarea|añadir)/i, '')
      .replace(/(mañana|hoy|tarde|noche|urgente|importante|alta|media|baja)/gi, '')
      .replace(/a las? \d+:\d+/gi, '')
      .replace(/a las? \d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return title || 'Tarea sin título';
  }
}

module.exports = new Parser();