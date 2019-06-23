const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({dest: './public/uploads/temp'});
const { isAuth } = require('../middlewares/auth');
const filesController = require('../controllers/files.js');

router.post('/?*?/\%3Fupload', isAuth, upload.array('files'), filesController.upload);  // %3F == ?
router.post('/?*?/\%3Fnewfolder', isAuth, filesController.newfolder);   // %3F == ?
router.get('/*', isAuth, filesController.index);

module.exports = router;