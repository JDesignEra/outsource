const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const servicesController = require('../controllers/service.js');

router.get('/', servicesController.index)

router.get('/:uid/:id', servicesController.view)

router.get('/add', servicesController.add)

router.post('/add', upload.single('serviceposter'), servicesController.addpost)

router.get('/edit/:id', servicesController.edit)

router.put('/save/:id', servicesController.save)

router.get('/delete/:id', servicesController.delete)

//Lemuel
router.get('/payment', servicesController.payment)

module.exports = router;