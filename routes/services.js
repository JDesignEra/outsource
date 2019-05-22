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
    Services.findOne({
        where: {
            id: req.params.id
        }
    }).then((services) => {
        if (req.user.id === services.userId) {
            res.render('./services/EditService', {
                services
            });
        }
        else {
            alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            req.logOut();
            res.redirect('/');
        }
    }

    ).catch(err => console.log(err));
    
})

module.exports = router;