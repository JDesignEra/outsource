const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.render('index', {
        url: req.originalUrl
    });
});

module.exports = router;