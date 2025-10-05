const axios = require('axios');
const config = require('./env');
const logger = require('./logger');

class WhatsAppClient {
  constructor() {
    this.apiBase = config.whatsapp.apiBase;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.apiBase}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      logger.info('WhatsApp message sent', { to, messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error('WhatsApp send error:', error.response?.data || error.message);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      await axios.post(
        `${this.apiBase}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      logger.error('WhatsApp mark as read error:', error.message);
    }
  }
}

module.exports = new WhatsAppClient();