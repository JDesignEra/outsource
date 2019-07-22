const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({dest: './public/uploads/temp'});
const { isAuth } = require('../middlewares/auth');
const filesController = require('../controllers/files.js');

router.post('^/:dir([/%-_a-zA-z0-9]+)?/~addshareuser', isAuth, filesController.addShareUser);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~copy', isAuth, filesController.copy);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~delete', isAuth, filesController.delete);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~delshareuser', isAuth, filesController.delShareUser);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~move', isAuth, filesController.move);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~newfile', isAuth, filesController.newfile);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~newfolder', isAuth, filesController.newfolder);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~rename', isAuth, filesController.rename);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~sharecode', isAuth, filesController.sharecode);
router.post('^/:dir([/%-_a-zA-z0-9]+)?/~upload', isAuth, upload.array('files'), filesController.upload); 
router.get('^/(:fid([0-9]+)?|:code?)/~download', filesController.download);
router.get('^/:dir([/%-_~a-zA-z0-9]+)?', isAuth, filesController.index);

module.exports = router;