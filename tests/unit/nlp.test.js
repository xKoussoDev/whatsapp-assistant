const nlpService = require('../../src/services/nlpService');
const parser = require('../../src/nlp/parser');
const intents = require('../../src/nlp/intents');

describe('NLP Service', () => {
  test('should detect create task intent', () => {
    const result = nlpService.processMessage('Recuérdame estudiar mañana');
    expect(result.intent).toBe(intents.CREATE_TASK);
    expect(result.entities.title).toBeTruthy();
  });
  
  test('should extract date correctly', () => {
    const date = parser.extractDate('mañana a las 3pm');
    expect(date).toBeInstanceOf(Date);
    expect(date.getHours()).toBe(15);
  });
  
  test('should extract priority', () => {
    const priority = parser.extractPriority('tarea urgente para hoy');
    expect(priority).toBe('high');
  });
  
  test('should detect list tasks intent', () => {
    const result = nlpService.processMessage('mostrar mis tareas');
    expect(result.intent).toBe(intents.LIST_TASKS);
  });
});