const Services = require('../models/services');

module.exports = {
    index: function (req, res) {
        res.render('services/listServices')
        // Services.findAll({
        //     where: {
        //         userId: req.user.id
        //     },
        //     order: [
        //         ['title', 'ASC']
        //     ],
        //     raw: true
        // })
        //     .then((services) => {
        //         res.render('services/listServices', {
        //             services: services,
        //             user: req.user
        //         });
        //     })
        //     .catch(err => console.log(err));
    },
    view: function (req, res) {
        res.render('./services/viewService')
    },
    add: function (req, res) {
        res.render('services/AddService')
    },
    addpost: function (req, res) {
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
    },
    edit: function (req, res) {
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
                alertMessage(res, 'danger', 'You do not have permission to modify this service', 'fas fa-exclamation-circle', true);
                req.logOut();
                res.redirect('/');
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
                alertMessage(res, 'Success', 'Changes saved successfully!', 'fas fa-exclamation-circle', true);
                res.redirect('/services/listServices');
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
    },
    payment: function (req, res) {
        res.render("./services/servicePayment")
    }
}