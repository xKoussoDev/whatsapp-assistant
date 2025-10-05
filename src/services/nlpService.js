const classifier = require('../nlp/classifier');
const parser = require('../nlp/parser');
const intents = require('../nlp/intents');

class NLPService {
  processMessage(text) {
    const intent = classifier.classify(text);
    const entities = {};

    switch (intent) {
      case intents.CREATE_TASK:
        entities.title = parser.extractTitle(text);
        entities.dueAt = parser.extractDate(text);
        entities.priority = parser.extractPriority(text);
        break;
        
      case intents.COMPLETE_TASK:
      case intents.DELETE_TASK:
        entities.taskNumber = parser.extractTaskNumber(text);
        break;
        
      case intents.LIST_TASKS:
        entities.date = parser.extractDate(text) || new Date();
        break;
    }

    return {
      intent,
      entities,
      originalText: text
    };
  }
}

module.exports = new NLPService();