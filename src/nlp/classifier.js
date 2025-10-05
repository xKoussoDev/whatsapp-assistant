const natural = require('natural');
const intents = require('./intents');

class Classifier {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }

  trainClassifier() {
    // CREATE_TASK patterns
    this.classifier.addDocument('recuérdame', intents.CREATE_TASK);
    this.classifier.addDocument('recordarme', intents.CREATE_TASK);
    this.classifier.addDocument('crear tarea', intents.CREATE_TASK);
    this.classifier.addDocument('agregar tarea', intents.CREATE_TASK);
    this.classifier.addDocument('añadir tarea', intents.CREATE_TASK);
    this.classifier.addDocument('nueva tarea', intents.CREATE_TASK);
    this.classifier.addDocument('tengo que', intents.CREATE_TASK);
    this.classifier.addDocument('necesito', intents.CREATE_TASK);
    
    // LIST_TASKS patterns
    this.classifier.addDocument('lista tareas', intents.LIST_TASKS);
    this.classifier.addDocument('mis tareas', intents.LIST_TASKS);
    this.classifier.addDocument('qué tengo pendiente', intents.LIST_TASKS);
    this.classifier.addDocument('mostrar tareas', intents.LIST_TASKS);
    this.classifier.addDocument('ver tareas', intents.LIST_TASKS);
    this.classifier.addDocument('tareas de hoy', intents.LIST_TASKS);
    this.classifier.addDocument('pendientes', intents.LIST_TASKS);
    
    // COMPLETE_TASK patterns
    this.classifier.addDocument('marcar completada', intents.COMPLETE_TASK);
    this.classifier.addDocument('marca hecha', intents.COMPLETE_TASK);
    this.classifier.addDocument('completar tarea', intents.COMPLETE_TASK);
    this.classifier.addDocument('tarea completada', intents.COMPLETE_TASK);
    this.classifier.addDocument('ya hice', intents.COMPLETE_TASK);
    this.classifier.addDocument('terminé', intents.COMPLETE_TASK);
    
    // DELETE_TASK patterns
    this.classifier.addDocument('borrar tarea', intents.DELETE_TASK);
    this.classifier.addDocument('eliminar tarea', intents.DELETE_TASK);
    this.classifier.addDocument('quitar tarea', intents.DELETE_TASK);
    this.classifier.addDocument('cancelar tarea', intents.DELETE_TASK);
    
    // HELP patterns
    this.classifier.addDocument('ayuda', intents.HELP);
    this.classifier.addDocument('help', intents.HELP);
    this.classifier.addDocument('qué puedes hacer', intents.HELP);
    this.classifier.addDocument('comandos', intents.HELP);
    this.classifier.addDocument('cómo funciona', intents.HELP);
    
    // GREETING patterns
    this.classifier.addDocument('hola', intents.GREETING);
    this.classifier.addDocument('buenos días', intents.GREETING);
    this.classifier.addDocument('buenas tardes', intents.GREETING);
    this.classifier.addDocument('buenas noches', intents.GREETING);
    this.classifier.addDocument('hey', intents.GREETING);
    
    this.classifier.train();
  }

  classify(text) {
    const classification = this.classifier.getClassifications(text);
    const topIntent = classification[0];
    
    if (topIntent.value < 0.5) {
      return intents.UNKNOWN;
    }
    
    return topIntent.label;
  }
}

module.exports = new Classifier();