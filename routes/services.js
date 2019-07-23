const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const servicesController = require('../controllers/service.js');

router.get('/', servicesController.index)

router.get('/view/:uid/:id', servicesController.view)

router.get('/manage', isAuth, servicesController.management)

router.get('/add', isAuth, servicesController.add)

router.post('/add', upload.single('serviceposter'), servicesController.addpost)

router.get('/edit/:id', isAuth, servicesController.edit)

router.post('/edit/:id', upload.single('serviceposter'), servicesController.save)

router.get('/delete/:id', isAuth, servicesController.delete)

router.post('/fav/:id', servicesController.fav)

//Lemuel
router.get('/payment/:id', isAuth, servicesController.payment)

router.post('/payment/:id', isAuth, servicesController.sendPayment)

router.get('/payment/:id/success/', isAuth, servicesController.PaymentSuccess)

router.get('/receipt/', isAuth, servicesController.transactions)

router.get('/receipt/:id/', isAuth, servicesController.viewPaymentDetails)

module.exports = router;