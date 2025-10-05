const router = require('express').Router();
const reminderController = require('../controllers/reminderController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', reminderController.create);
router.get('/', reminderController.list);
router.delete('/:id', reminderController.delete);

module.exports = router;