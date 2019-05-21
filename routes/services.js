const express = require('express');
const router = express.Router();
const Services = require('../models/Services');

router.get('/viewServices', (req,res) =>{
    res.render('./services/listServices')
})

router.get('/addService', (req,res)=>{
    res.render('./services/AddService')
})

router.get('/editService/:id', (req,res)=>{
    res.render('./services/EditService')
})

module.exports = router;