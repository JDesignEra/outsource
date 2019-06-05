const express = require('express');
const router = express.Router();
const filesController = require('../controllers/files.js');

// ToDo: /:userId
router.get('/', filesController.index);

module.exports = router;