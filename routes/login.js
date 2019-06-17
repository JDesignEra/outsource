const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login');

router.post('/', loginController.index);
router.get('/', loginController.index);

module.exports = router;