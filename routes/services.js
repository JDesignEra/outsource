const express = require('express');
const router = express.Router();

router.get('/viewServices', (req,res) =>{
    res.render('./services/listServices')
})

module.exports = router;