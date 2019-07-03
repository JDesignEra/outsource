const Services = require('../models/services');
const Users = require('../models/users');
const fs = require('fs');

module.exports = {
    index: function (req, res) {
        Services.findAll({
            order: [
                ['name', 'ASC']
            ],
            raw: true
        })
            .then((services) => {
                res.render('services/list', {
                    services: services,
                });
            })
            .catch(err => console.log(err));
    },
    view: function (req, res) {
        Users.findOne({
            where: {
                id: req.user.id
            }
        }).then((user)=>{
            Services.findOne({
                where: {
                    id: req.params.id
                }
            }).then((services) => {
                Services.update({
                    views: services.views + 1
                }, {
                        where: {
                            id: req.params.id
                        }
                    }).then(() => {
                        res.render('services/index', {
                            services,
                            user
                        });
                    })
            }).catch(err => console.log(err));
        })
        
    },
    add: function (req, res) {
        if (req.user.accType === 'service') {
            res.render('services/add')
        }
        else {
            req.flash('warning', 'You need a service provider account to add a service');
            res.redirect('/');
        }
    },
    addpost: function (req, res) {
        let name = req.body.name;
        let desc = req.body.desc === undefined ? '' : req.body.desc.slice(0, 1999);
        let userId = req.user.id;
        let price = req.body.price;
        let category = req.body.categories.toString();
        Services.create({
            name,
            desc,
            price,
            uid: userId,
            category,
            views: 0,
            date: new Date().getTime()
        }).then((services) => {
            if (req.file !== undefined) {
                // Check if directory exists if not create directory
                if (!fs.existsSync('./public/uploads/services/' + req.user.id)) {
                    fs.mkdirSync('./public/uploads/services/' + req.user.id);
                }
                // Move file
                let serviceId = services.id;
                fs.renameSync(req.file['path'], './public/uploads/services/' + req.user.id + '/' + serviceId + '.png');
            }
            res.redirect('/profile');
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
                res.redirect('/');
            }
        }

        ).catch(err => console.log(err));
    },
    save: function (req, res) {
        Services.update({
            name: req.body.name,
            desc: req.body.desc === undefined ? '' : req.body.desc.slice(0, 1999),
            price: req.body.price,
            category: req.body.categories.toString(),
            date: new Date().getTime()
        }, {
                where: {
                    id: req.params.id
                }
            }).then(() => {
                if (req.file !== undefined) {
                    console.log(req.params.id);
                    // Check if directory exists if not create directory
                    if (!fs.existsSync('./public/uploads/services/' + req.user.id)) {
                        fs.mkdirSync('./public/uploads/services/' + req.user.id);
                    }
                    // Move file
                    let serviceId = req.params.id;
                    fs.renameSync(req.file['path'], './public/uploads/services/' + req.user.id + '/' + serviceId + '.png');
                }
                req.flash('success', 'Changes saved successfully!');
                res.redirect('/profile');
            }).catch(err => console.log(err));
    },
    delete: function (req, res) {
        Services.findOne({
            where: {
                id: req.params.id,
                uid: req.user.id
            },
        }).then((services) => {

            if (services == null) {
                req.flash('warning', 'You do not have any services to delete');
                res.redirect('/profile');
            }

            else {
                Services.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then((services) => {
                    req.flash('success', 'Service successfully deleted!');
                    res.redirect('/profile');
                })
            }
        })
    },
    payment: function (req, res) {
        res.render('services/payment');
    }
}