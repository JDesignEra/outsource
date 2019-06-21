const Services = require('../models/services');
const fs = require('fs');

module.exports = {
    index: function (req, res) {
        // res.render('services/list')
        Services.findAll({
            where: {
                uid: req.user.id
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        })
            .then((services) => {
                res.render('services/list', {
                    services: services,
                    user: req.user
                });
            })
            .catch(err => console.log(err));
    },
    view: function (req, res) {
        res.render('services/index')
    },
    add: function (req, res) {
        if (req.user.accType === 'service') {
            res.render('services/add')
        }
        else {
            req.flash('warning', 'You need a service provider account to add a service');
            res.redirect('/services');
        }
    },
    addpost: function (req, res) {
        let name = req.body.name;
        let desc = req.body.desc === undefined ? '' : req.body.desc.slice(0, 1999);
        let userId = req.user.id;
        let price = req.body.price;
        let category = req.body.categories.toString();
        let posterURL = req.body.posterURL;

        Services.create({
            name,
            desc,
            price,
            uid: userId,
            category,
            posterURL
        }).then((services) => {
            // Check if directory exists if not create directory
            if (!fs.existsSync('./public/uploads/services/' + req.user.id)) {
                fs.mkdirSync('./public/uploads/services/' + req.user.id);
            }
            // Move file
            let serviceId = services.id;
            fs.renameSync(req.file['path'], './public/uploads/services/' + req.user.id + '/' + serviceId + '.png');
            res.redirect('/services');
        })
            .catch(err => console.log(err))
    },
    edit: function (req, res) {
        Services.findOne({
            where: {
                id: req.params.id
            }
        }).then((services) => {
            if (req.user.id === services.uid) {
                res.render('services/edit', {
                    services
                });
            }
            else {
                req.flash('warning', 'You do not have permission to modify this service');
                res.redirect('/services');
            }
        }

        ).catch(err => console.log(err));
    },
    save: function (req, res) {
        Services.update({
            name: req.body.name,
            desc: req.body.desc.slice(0, 1999),
            price: req.body.price,
            category: req.body.categories.toString(),
            posterURL: req.body.posterURL
        }, {
                where: {
                    id: req.params.id
                }
            }).then(() => {
                req.flash('success', 'Changes saved successfully');
                res.render('services/list');
            }).catch(err => console.log(err));
    },
    delete: function (req, res) {
        Services.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
        }).then((services) => {
            if (services == null) {
                req.flash('warning', 'You do not have any services to delete');
                res.redirect('/services');
            }
            else {
                Services.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then((services) => {
                    req.flash('success', 'Your service was successfully deleted');
                    res.render('services/list');
                })
            }
        })
    },
    payment: function (req, res) {
        res.render('services/payment');
    }
}