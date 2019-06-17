const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');

// ToDo: /profile/uid url
router.get('/profile', profileController.index);

module.exports = router;