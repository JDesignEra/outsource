const express = require('express');
const router = express.Router();
const registerController = require('../controllers/register');

router.get('/', registerController.index);
router.post('/', registerController.index);

module.exports = router;