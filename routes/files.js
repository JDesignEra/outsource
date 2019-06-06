const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const filesController = require('../controllers/files.js');

router.get('/', filesController.index);
router.post('/upload', upload.array('files'), filesController.upload);

module.exports = router;