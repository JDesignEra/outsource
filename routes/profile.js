const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const profileController = require('../controllers/profile');

// ToDo: /uid url
router.get('/', profileController.index);
router.get('/submit', profileController.submit)
router.post('/submit', upload.single('coverPicture'), profileController.submitProject)
module.exports = router;