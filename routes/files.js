const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({dest: './public/uploads/temp'});
const { isAuth } = require('../middlewares/auth');
const filesController = require('../controllers/files.js');

router.get('/*', isAuth, filesController.index);
router.get('/:path', filesController.index);

router.post('/upload', upload.array('files'), filesController.upload);
router.get('/upload', filesController.upload);

module.exports = router;