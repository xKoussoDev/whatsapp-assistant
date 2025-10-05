const request = require('supertest');
const app = require('../../src/app');
const config = require('../../src/config/env');

describe('WhatsApp Webhook', () => {
  test('should verify webhook', async () => {
    const response = await request(app)
      .get('/webhook/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': config.whatsapp.verifyToken,
        'hub.challenge': 'test_challenge'
      });
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('test_challenge');
  });
  
  test('should reject invalid verify token', async () => {
    const response = await request(app)
      .get('/webhook/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token',
        'hub.challenge': 'test_challenge'
      });
    
    expect(response.status).toBe(403);
  });
  
  test('should accept incoming message', async () => {
    const response = await request(app)
      .post('/webhook/whatsapp')
      .send({
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                id: 'msg_id',
                timestamp: Date.now(),
                text: { body: 'Hola' },
                type: 'text'
              }],
              contacts: [{
                profile: { name: 'Test User' }
              }]
            }
          }]
        }]
      });
    
    expect(response.status).toBe(200);
  });
});