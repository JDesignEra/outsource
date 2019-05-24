const express = require('express');
const router = express.Router();
const Services = require('../models/Services');
const ensureAuthenticated = require('../helpers/auth');

router.get('/viewServices', (req, res)=>{
    res.render('./services/listServices');
})

// router.get('/viewServices', ensureAuthenticated, (req,res) =>{
//     Services.findAll({
//         where: {
//             userId: req.user.id
//         },
//         order: [
//             ['name', 'ASC']
//         ],
//         raw: true
//     })
//         .then((services) => {
//             res.render('./services/listServices', {
//                 services: services,
//                 user: req.user
//             });
//         })
//         .catch(err => console.log(err));

// })

router.get('/addService', (req,res)=>{
    res.render('./services/AddService')
})

router.post('/addService', ensureAuthenticated, (req, res) => {
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

router.get('/editService/:id', ensureAuthenticated, (req,res)=>{
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
            alertMessage(res, 'danger', 'You do not have permission to edit this service', 'fas fa-exclamation-circle', true);
            req.logOut();
            res.redirect('/');
        }
    }

    ).catch(err => console.log(err));
    
})

router.put('/saveService/:id', (req, res) => {
    Services.update({
        name: req.body.name,
        desc: req.body.desc.slice(0,1999),
        price: req.body.price,
        posterURL: req.body.posterURL
    }, {
            where: {
                id: req.params.id
            }
        }).then(() => {
            alertMessage(res, 'Success', 'Changes saved', 'fas fa-exclamation-circle', true);
            res.redirect('/services/listServices');
        }).catch(err => console.log(err));
})


router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    Services.findOne({
        where: {
            id: req.params.id,
            userId: req.user.id
        },
    }).then((services) => {
        if (services == null) {
            alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
        else {
            Services.destroy({
                where: {
                    id: req.params.id
                }
            }).then((services) => {
                alertMessage(res, 'Success', 'Service deleted successfully!', 'fas fa-exclamation-circle', true);
                res.redirect('/services/listServices');
            })
        }
    })
})

module.exports = router;