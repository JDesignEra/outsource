const express = require('express');
const router = express.Router();
const multer = require('multer')

const upload = multer({dest: './public/uploads/temp'});
const { isAuth } = require('../middlewares/auth');
const filesController = require('../controllers/files.js');

router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~addshareuser', isAuth, filesController.addShareUser);
router.post('(/my-drive|/share-drive)?/:dir([/%-~_a-z0-9]+)?/~comment', isAuth, filesController.comment);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~copy', isAuth, filesController.copy);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~delete', isAuth, filesController.delete);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~delshareuser', isAuth, filesController.delShareUser);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~gdrivecopy', isAuth, filesController.googleDriveCopy);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~gdriveupload', isAuth, upload.array('files'), filesController.googleDriveUpload);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~move', isAuth, filesController.move);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~newfile', isAuth, filesController.newfile);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~newfolder', isAuth, filesController.newfolder);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~rename', isAuth, filesController.rename);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~sharecode', isAuth, filesController.sharecode);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)(/~preview/~edit|/~preview|/~edit)?/~save', isAuth, filesController.save);
router.post('(/my-drive)?/:dir([/%-_a-z0-9]+)?/~upload', isAuth, upload.array('files'), filesController.upload); 

router.get('(/my-drive|/share-drive)?/:dir([/%-_a-z0-9]+)?/:fid([0-9]+)/:code?/~download', filesController.download);
router.get('(/my-drive|/share-drive)?/:dir([/%-_a-z0-9]+)?/:fid([0-9]+)(/~preview)?/~edit', isAuth, filesController.edit);
router.get('(/my-drive|/share-drive)?/:dir([/%-_a-z0-9]+)?/:fid([0-9]+)/~preview(/~comments)?', isAuth, filesController.preview);
router.get('/:sharecode([a-z0-9]+)/:dir([/%-_a-z0-9]+)?/~shared', filesController.sharedIndex);
router.get('/:sharecode([a-z0-9]+)/:fid([0-9]+)/:dir([/%-_a-z0-9]+)?/~spreview', filesController.sharedPreview);
router.get('(/my-drive|/share-drive)?/:dir([/%-~_a-z0-9]+)?', isAuth, filesController.index);

module.exports = router;