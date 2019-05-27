const express = require('express');
const router = express.Router();

router.get('/profile', (req , res) => {

    res.render('user/profile')
});

router.get('/register',(req, res) => {
    res.render('user/register')
});

router.get('/login',(req,res) => {
    res.render('user/login')
});

module.exports = router;