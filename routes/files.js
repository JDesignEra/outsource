const express = require('express');
const router = express.Router();
const filesController = require('../controllers/files.js');

router.get('/', filesController.index);
router.post('/upload', filesController.upload);

module.exports = router;