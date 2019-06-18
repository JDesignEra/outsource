const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const servicesController = require('../controllers/service.js');

router.get('/', servicesController.index)

router.get('/:uid/:id', servicesController.view)

router.get('/add', servicesController.add)

router.post('/add', servicesController.addpost)

router.get('/edit/:id', servicesController.edit)

router.put('/save/:id', servicesController.save)

router.get('/delete/:id', servicesController.delete)

//Lemuel
router.get('/payment', servicesController.payment)

module.exports = router;