const config = require('../config/env');
const whatsappService = require('../services/whatsappService');
const logger = require('../config/logger');

exports.verify = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    logger.info('Webhook verified');
    res.status(200).send(challenge);
  } else {
    logger.warn('Webhook verification failed');
    res.sendStatus(403);
  }
};

exports.receive = async (req, res) => {
  try {
    const { entry } = req.body;
    
    if (entry && entry[0].changes && entry[0].changes[0]) {
      const change = entry[0].changes[0];
      
      if (change.value.messages && change.value.messages[0]) {
        const message = change.value.messages[0];
        const contact = change.value.contacts[0];
        
        await whatsappService.handleIncomingMessage({
          from: message.from,
          id: message.id,
          timestamp: message.timestamp,
          text: message.text,
          type: message.type,
          profile: contact?.profile
        });
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error:', error);
    res.sendStatus(200); // Always return 200 to avoid retries
  }
};