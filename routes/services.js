const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const servicesController = require('../controllers/service.js');

router.get('/', servicesController.index)

router.get('/view/:uid/:id', servicesController.view)

router.get('/add', servicesController.add)

router.post('/add', upload.single('serviceposter'), servicesController.addpost)

router.get('/edit/:id', servicesController.edit)

router.post('/save/:id', upload.single('serviceposter'), servicesController.save)

router.get('/delete/:id', servicesController.delete)

//Lemuel
router.get('/payment', servicesController.payment)

module.exports = router;