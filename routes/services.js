const express = require('express');
const router = express.Router();
const Services = require('../models/Services');
const ensureAuthenticated = require('../middlewares/auth');
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/', (req, res)=>{
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

router.get('/add', (req,res)=>{
    res.render('./services/AddService')
})

router.get('/:id', (req,res)=>{
    res.render('./services/viewService')
})

router.post('/add', (req, res) => {
    let name = req.body.name;
    let desc = req.body.desc.slice(0, 1999);
    let userId = req.user.id;
    let price = req.body.price;
    let category = req.body.categories.toString();
    let posterURL = req.body.posterURL;
    
    Services.create({
        name,
        desc,
        price,
        userId,
        category,
        posterURL
    }).then((services) => {
        res.redirect('/services');
    })
    .catch(err => console.log(err))
});

router.get('/edit/:id', ensureAuthenticated, (req,res)=>{
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

router.put('/save/:id', (req, res) => {
    Services.update({
        name: req.body.name,
        desc: req.body.desc.slice(0,1999),
        price: req.body.price,
        category: req.body.categories.toString(),
        posterURL: req.body.posterURL
    }, {
            where: {
                id: req.params.id
            }
        }).then(() => {
            alertMessage(res, 'Success', 'Changes saved successfully!', 'fas fa-exclamation-circle', true);
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
            alertMessage(res, 'danger', 'You do not have permission to modify this service', 'fas fa-exclamation-circle', true);
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

router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id);
    }
    upload(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
            }
        }
    });
})




//Lemuel

router.get("/payment", (req, res) => {
    res.render("./services/servicePayment")
});


module.exports = router;