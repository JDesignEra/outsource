const express = require('express');
const router = express.Router();

const passport = require('passport');

const { isAuth } = require('../middlewares/auth');
const authController = require('../controllers/auth');

router.get('/logout', authController.logout);

router.post('/login', authController.login);
router.get('/login', authController.login);

router.post('/register', authController.register);
router.get('/register', authController.register);

router.post('/forgot', authController.forgot);
router.get('/forgot', authController.forgot);

router.get('/reset/:token', authController.reset);
router.post('/reset/:token', authController.reset);

router.get('/changepass', isAuth, authController.changepw);
router.post('/changepass', isAuth, authController.changepw);

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'https://www.googleapis.com/auth/drive.file', 'email'],
    accessType: 'offline',
    prompt: 'consent',
    successRedirect: '/',
    failureRedirect: '/register',
    successFlash: true,
    failureFlash: true
}));

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/register/client/facebook/callback', passport.authenticate('fbRegisterClient', {
        successRedirect: '/', 
        failureRedirect: '/register',
        failureFlash: true
    }
));
router.get('/register/service/facebook/callback', passport.authenticate('fbRegisterService', {
        successRedirect: '/', 
        failureRedirect: '/register',
        successFlash: true,
        failureFlash: true
    }
));
router.get('/login/facebook/callback', passport.authenticate('facebookLogin', {
		successRedirect: '/', 
        failureRedirect: '/register',
        successFlash: true,
        failureFlash: true
	}
));

router.get('/chart', isAuth, authController.chart);

module.exports = router;