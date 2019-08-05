const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const servicesController = require('../controllers/service.js');

router.get('/', servicesController.index)

router.get('/view/:uid/:id', isAuth, servicesController.view)

router.get('/manage', isAuth, servicesController.management)

router.get('/add', isAuth, servicesController.add)

router.post('/add', isAuth, upload.single('serviceposter'), servicesController.addpost)

router.get('/edit/:id', isAuth, servicesController.edit)

router.post('/edit/:id', isAuth, upload.single('serviceposter'), servicesController.save)

router.get('/delete/:id', isAuth, servicesController.delete)

router.post('/fav/:id', isAuth, servicesController.fav)

router.get('/requests', isAuth, servicesController.requests)

//Lemuel
router.get('/payment/:id/:jobID', isAuth, servicesController.payment)

router.post('/payment/:id/:jobID', isAuth, servicesController.sendPayment)

router.get('/paymentSuccess/:id/:jobID', isAuth, servicesController.PaymentSuccess)

router.get('/receipt/', isAuth, servicesController.transactions)

router.get('/receipt/:id/', isAuth, servicesController.viewPaymentDetails)

// router.get('/test', servicesController.test)
module.exports = router;