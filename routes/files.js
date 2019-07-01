const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({dest: './public/uploads/temp'});
const { isAuth } = require('../middlewares/auth');
const filesController = require('../controllers/files.js');

router.post('^/:dir([/%_-a-zA-z0-9]+)?/~delete', isAuth, filesController.delete);
router.post('^/:dir([/%_-a-zA-z0-9]+)?/~newfolder', isAuth, filesController.newfolder);
router.post('^/:dir([/%_-a-zA-z0-9]+)?/~upload', isAuth, upload.array('files'), filesController.upload); 
router.get('^/:dir([/%_-~a-zA-z0-9]+)?', isAuth, filesController.index);

module.exports = router;