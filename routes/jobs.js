const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({dest: './public/uploads/temp'});
const jobController = require('../controllers/jobs.js')

router.get('/', isAuth, jobController.index);
router.post('/add/:id', isAuth, jobController.add);
router.get('/delete/:id', isAuth, jobController.delete);
router.get('/accept/:id', isAuth, jobController.accept);

module.exports = router;