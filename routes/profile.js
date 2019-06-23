const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');

// ToDo: /uid url
router.get('/', profileController.index);
router.get('/submit', profileController.submit)
module.exports = router;