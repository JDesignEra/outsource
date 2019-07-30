const Jobs = require('../models/jobs');
const Services = require('../models/services');

let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1;
let yyyy = today.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
}

if (mm < 10) {
    mm = '0' + mm;
}
today = dd + '/' + mm + '/' + yyyy;

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
            // if (services.uid == req.user.id) {
            //     req.flash('warning', 'You cannot buy your own service');
            //     res.redirect('/services');
            // }
            // else {
                let remarks = req.body.remarks == undefined ? "" : req.body.remarks.slice(0, 1999);
                Jobs.create({
                    uid: services.uid,
                    date: today,
                    name: services.name,
                    remarks,
                    salary: services.price
                }).then(job => {
                    req.flash('success', 'Job request sent successfully!');
                    res.redirect('/services');
                })
            //}

        })
    },
    delete: function(req, res){
        Jobs.findOne({
            where: {
                id: req.params.id
            }
        }).then(job => {
            if (job == null) {
                req.flash('warning', 'You do not have any jobs to reject');
                res.redirect('/job');
            }
            else {
                Jobs.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then(() => {
                    req.flash('success', 'Job rejected');
                    res.redirect('/job');
                })
            }
        })
    }
}