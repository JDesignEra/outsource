const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const servicesController = require('../controllers/service.js');
const jobController = require('../controllers/jobs.js')

router.get('/', jobController.index);

module.exports = router;