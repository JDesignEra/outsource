const express = require('express');
const router = express.Router();

// ToDo: /:userId
router.get('/', (req, res) => {
    res.render('files/view', {
        title: "File Management",
        url: req.originalUrl
    })
});

module.exports = router;