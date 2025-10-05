const router = require('express').Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', taskController.create);
router.get('/', taskController.list);
router.get('/:id', taskController.get);
router.patch('/:id', taskController.update);
router.delete('/:id', taskController.delete);

module.exports = router;