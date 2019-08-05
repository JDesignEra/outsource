const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuth } = require('../middlewares/auth');
const upload = multer({dest: './public/uploads/temp'});
const authController = require('../controllers/auth');
const profileController = require('../controllers/profile');

//Notifications
router.get('/notifications/', isAuth, profileController.viewNotification)
router.get('/deleteNotifications/:id', isAuth, profileController.deleteNotification)
router.get('/deleteAllNotifications/:category', profileController.deleteAllNotification)

//Profile
router.get('/', isAuth, profileController.index);
router.get('/openProject/:open', isAuth, profileController.index)

router.get('/view/:id', profileController.viewProfile);
router.get('/view/:id/:open', profileController.viewProfile)
router.get('/follow/:id', isAuth, profileController.follow)
router.get('/unfollow/:id', isAuth, profileController.unfollow)

//Like Project
router.get('/like/:id', isAuth, profileController.likeProject)
router.get('/unlike/:id', isAuth, profileController.unlikeProject)
router.get('/viewProject/:id', profileController.viewProjectUpdate)

//Edit Profile
router.get('/edit', isAuth, profileController.editProfile);
router.post('/edit', isAuth, profileController.editProfilePost);

//Comment Project
router.post('/commentProject/:projectID', isAuth, profileController.postComment)

//Submit Project
router.get('/submit', isAuth, profileController.submit)
router.post('/submit', isAuth, upload.single('coverPicture'), profileController.submitProject)

//Edit Project
router.get('/editProject/:id', isAuth, profileController.editProject)
router.post('/editProject/:id', upload.single('coverPicture'), isAuth, profileController.editProjectPost)

//View and delete Project
router.get('/delete/:id', isAuth, profileController.deleteProject)

//Change and Delete Account
router.get('/edit/:id', isAuth, authController.delete);
router.get('/auth/reset', isAuth, authController.changepw);


module.exports = router;