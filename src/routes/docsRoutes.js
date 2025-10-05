const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('../docs/swagger.json');

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

module.exports = router;