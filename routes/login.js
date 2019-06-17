const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login');

router.get('/', loginController.index);
router.post('/', loginController.index);

module.exports = router;