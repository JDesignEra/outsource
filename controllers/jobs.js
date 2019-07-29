const Jobs = require('../models/jobs');
const Services = require('../models/services');

module.exports = {
    index: function (req, res) {
        Jobs.findAll({
            where: {
                uid: req.user.id
            }
        }).then(job => {
            res.render("jobs/jobdash", {
                job
            })
        })
    },
    add: function (req, res) {
        Services.findOne({
            where: {
                id: req.params.id
            }
        }).then(services => {
            if (services.uid == req.user.id) {
                req.flash('warning', 'You cannot buy your own service');
                res.redirect('/services');
            }
            else {
                Jobs.create({
                    uid: services.uid,
                    name: services.name,
                    desc: services.desc,
                    salary: services.price,
                    category: services.category
                }).then(job => {
                    req.flash('success', 'Job request sent successfully!');
                    res.redirect('/services');
                })
            }

        })
    }
}