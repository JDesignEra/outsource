const Jobs = require('../models/jobs');
const Services = require('../models/services');
Notification = require('../models/notifications')

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
            Jobs.findOne({
                where: {
                    cid: req.user.id,
                    sid: services.id
                }
            }).then((jobs) => {
                if (services.uid == req.user.id) {
                    req.flash('warning', 'You cannot purchase your own service');
                    res.redirect('back');
                }

                else if (jobs == null) {
                    let remarks = req.body.remarks == undefined ? "None" : req.body.remarks.slice(0, 1999);
                    Jobs.create({
                        uid: services.uid,
                        uname: services.username,
                        sid: services.id,
                        cid: req.user.id,
                        cname: req.user.username,
                        date: today,
                        name: services.name,
                        remarks,
                        salary: services.price,
                        status: "unaccepted"
                    }).then(job => {
                        Notification.create({
                            uid: req.user.id,
                            username: req.user.username,
                            pid: services.id,
                            title: services.name,
                            date: new Date(),
                            category: "Jobs",
                            user: services.uid
                        })
                        req.flash('success', 'Job request sent successfully!');
                        res.redirect('/services/payment/' + services.id);
                    })
                }
                else if (jobs.cid == req.user.id && services.id == jobs.sid) {
                    req.flash('warning', 'You cannot request for this service twice');
                    res.redirect('back');
                }
            })
        })
    },

    delete: function (req, res) {
        Jobs.findOne({
            where: {
                id: req.params.id
            }
        }).then(job => {
            if (job == null) {
                req.flash('warning', 'You do not have any jobs to reject/cancel');
                res.redirect('back');
            }
            else {
                Jobs.destroy({
                    where: {
                        id: req.params.id
                    }
                }).then(() => {
                    if (job.cid !== req.user.id) {
                        Notification.create({
                            uid: req.user.id,
                            username: req.user.username,
                            pid: job.sid,
                            title: job.name,
                            date: new Date(),
                            category: "Requests_Cancel",
                            user: job.cid
                        })
                        req.flash('success', 'Job Reject');
                    }
                    else {
                        Notification.create({
                            uid: req.user.id,
                            username: req.user.username,
                            pid: job.sid,
                            title: job.name,
                            date: new Date(),
                            category: "Jobs_Reject",
                            user: job.uid
                        })
                        req.flash('success', 'Request cancelled');
                    }
                    res.redirect('back');
                })
            }
        })
    },

    accept: function (req, res) {
        Jobs.update({
            status: "accepted"
        }, {
                where: {
                    id: req.params.id
                }
            }).then((job) => {
                Jobs.findOne({
                    where: { id: req.params.id }
                }).then(job => {
                    Notification.create({
                        uid: req.user.id,
                        username: req.user.username,
                        pid: job.sid,
                        title: job.name,
                        date: new Date(),
                        category: "Requests",
                        user: job.cid
                    })
                    req.flash('success', 'Request accepted');
                    res.redirect('/job');
                })
                req.flash('success', 'Request accepted');
                res.redirect('/jobs');
            })
    },

    submit: function (req, res) {
        Jobs.update({
            status: "done"
        }), {
                where: {
                    id: req.params.id
                }
            }.then(()=>{
                req.flash('success', 'Job completed!');
                res.redirect('back');
            })
    },
    cancel: function(req, res){
        Jobs.update({
            status: "accepted"
        }), {
                where: {
                    id: req.params.id
                }
            }.then(()=>{
                req.flash('warning', 'Job uncomplete');
                res.redirect('back');
            })
    }
}