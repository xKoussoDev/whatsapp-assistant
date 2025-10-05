require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  
  db: {
    url: process.env.DATABASE_URL,
    sqlite: process.env.SQLITE_FILE || './data/app.sqlite'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expires: process.env.JWT_EXPIRES || '7d'
  },
  
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiBase: process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com/v20.0'
  },
  
  app: {
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:8080',
    timezone: process.env.TIMEZONE || 'America/Mexico_City'
  },
  
  cron: {
    checkTasks: process.env.CRON_CHECK_TASKS || '*/5 * * * *',
    dailySummary: process.env.CRON_DAILY_SUMMARY || '0 8 * * *',
    healthPing: process.env.CRON_HEALTH_PING || '*/10 * * * *'
  },
  
  healthPingUrl: process.env.HEALTH_PING_URL
};