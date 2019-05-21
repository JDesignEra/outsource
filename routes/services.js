const express = require('express');
const router = express.Router();
const Services = require('../models/Services');
const ensureAuthenticated = require('../helpers/auth');

router.get('/viewServices', (req,res) =>{
    Services.findAll({
        where: {
            userId: req.user.id
        },
        order: [
            ['name', 'ASC']
        ],
        raw: true
    })
        .then((services) => {
            // pass object to listServices.handlebar
            res.render('./services/listServices', {
                services: services,
                user: req.user
            });
        })
        .catch(err => console.log(err));

})

router.get('/addService', (req,res)=>{
    res.render('./services/AddService')
})

router.post('/addService', (req, res) => {
    let name = req.body.name;
    let desc = req.body.desc.slice(0, 1999);
    let userId = req.user.id;
    let price = req.body.price;
    let posterURL = req.body.posterURL;
    
    Services.create({
        name,
        desc,
        price,
        userId,
        posterURL
    }).then((services) => {
        res.redirect('/services/listServices');
    })
    .catch(err => console.log(err))
});

router.get('/editService/:id', (req,res)=>{
    res.render('./services/EditService')
})

module.exports = router;