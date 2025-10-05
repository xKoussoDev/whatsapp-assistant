const router = require('express').Router();
const webhookController = require('../controllers/webhookController');

router.get('/whatsapp', webhookController.verify);
router.post('/whatsapp', webhookController.receive);

module.exports = router;