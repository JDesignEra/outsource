const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuth } = require('../middlewares/auth');
const upload = multer({dest: './public/uploads/temp'});
const authController = require('../controllers/auth');
const profileController = require('../controllers/profile');

// ToDo: /uid url
router.get('/', isAuth, profileController.index);
router.get('/view/:id', profileController.viewProfile);
router.get('/follow/:id', profileController.follow)
router.get('/unfollow/:id', profileController.unfollow)

router.get('/like/:id', profileController.likeProject)
router.get('/unlike/:id', profileController.unlikeProject)


router.get('/edit', isAuth, profileController.editProfile);
router.post('/edit', isAuth, profileController.editProfilePost);

router.get('/submit', isAuth, profileController.submit)
router.post('/submit', upload.single('coverPicture'), profileController.submitProject)

router.get('/editProject/:id', isAuth, profileController.editProject)
router.post('/editProject/:id', upload.single('coverPicture'), isAuth, profileController.editProjectPost)


router.get('/view/:id', profileController.viewProject)
router.get('/delete/:id', profileController.deleteProject)
router.get('/edit/:id', authController.delete);

router.get('/auth/reset', authController.changepw);


module.exports = router;