Project = require('../models/portfolio')
User = require('../models/users')
Services = require('../models/services')
Servicefavs = require('../models/servicesfav')

fs = require('fs')
countries = require('countries-list')
moment = require('moment');
Op = require('sequelize').Op
// sequelize = require('sequelize')

function removeEmpty(array, item, length) {
    index = array.indexOf(item);
    for (i = 0; i < length; i++) {
        if (index > -1) {
            array.splice(index, 1);
        }
    }

}

module.exports = {
    index: function (req, res) {
        User.findOne({
            where: {
                id: req.user.id
            }
        }).then((user) => {

            if (user.skills != null) {
                skills = user.skills.split(',')
                removeEmpty(skills, '', skills.length)
                removeEmpty(skills, ' ', skills.length)
            }
            else {
                skills = []
            }

            if (user.social_media != null) {
                socialmedias = user.social_media.split(',')
                // removeEmpty(socialmedias , "", socialmedias.length)
            }
            else {
                socialmedias = []
            }
            console.log(socialmedias)

            Project.findAll({
                where: {
                    uid: req.user.id
                },
                order: [['datePosted', 'DESC']]
            }).then((projects) => {

                Services.findAll({
                    where: {
                        uid: req.user.id
                    }
                }).then((services) => {
                    Servicefavs.findAll({
                        where: {
                            uid: req.user.id
                        }
                    }).then((datas) => {
                        console.log("1")
                        let serviceIds = [];


                        for (const data of datas) {

                            serviceIds.push(data['sid']);
                            console.log('for')
                        }

                        // res.send(datas)

                        if (datas) {
                            console.log("if")
                            Services.findAll({
                                where: {
                                    id: { [Op.in]: serviceIds },
                                    uid: req.user.id
                                }
                            }).then((favs) => {
                                let services = [];
                                console.log("faves")
                                // res.render('profile/', {
                                //     projects: projects,
                                //     user: user,
                                //     services: services,
                                //     skills: skills,
                                //     social_medias: socialmedias,
                                //     favs: favs
                                // });

                                for (const [i, service] of favs.entries()) {
                                    console.log("Inside const for loop")
                                    temp = service;

                                    User.findOne({
                                        where: {
                                            id: service.uid
                                        },
                                        attributes: ['username']

                                    }).then(curr => {
                                        console.log("curr")
                                        temp['username'] = curr['username'];
                                        services.push(temp);

                                        if (i == favs.length - 1) {
                                            setTimeout(() => {
                                                res.render('profile/', {
                                                    projects: projects,
                                                    user: user,
                                                    services: services,
                                                    skills: skills,
                                                    social_medias: socialmedias,
                                                    favs: favs
                                                });
                                            }, 50);
                                        }
                                    })
                                }


                                console.log("Out")
                            })

                        }
                        else {
                            console.log("else")
                            res.render('profile/', {
                                projects: projects,
                                user: user,
                                services: services,
                                skills: skills,
                                social_medias: socialmedias
                            });

                        }


                    })

                })

            })
        })


    },

    viewProfile: function (req, res) {
        if (req.user.id == req.params.id) {
            res.redirect('/profile/')
        }
        else {
            User.findOne({
                where: {
                    id: req.params.id
                }
            }).then((viewuser) => {


                console.log(`Skills ${viewuser.skills}`)
                if (viewuser.skills != null) {
                    skills = viewuser.skills.split(',')
                    removeEmpty(skills, '', skills.length)
                    removeEmpty(skills, ' ', skills.length)
                }
                else {
                    skills = []
                }
                Project.findAll({
                    where: {
                        uid: viewuser.id
                    },
                }).then((projects) => {
                    Services.findAll({
                        where: {
                            uid: viewuser.id
                        }
                    }).then((services) => {
                        Servicefavs.findAll({
                            where: {
                                uid: viewuser.id
                            }
                        }).then((datas) => {
                            let serviceIds = [];

                            for (const data of datas) {
                                console.log("for")
                                serviceIds.push(data['sid']);
                            }
                            if (datas) {
                                console.log("if")
                                Services.findAll({
                                    where: {
                                        id: { [Op.in]: serviceIds },
                                        uid: viewuser.id
                                    }
                                }).then((favs) => {
                                    let services = [];
                                    console.log(favs.entries().length);
                                    if (favs.entries().length != undefined) {
                                        for (const [i, service] of favs.entries()) {
                                            let temp = service;
                                            console.log("FIRE");
                                            User.findOne({
                                                where: {
                                                    id: service.uid
                                                },
                                                attributes: ['username']
                                            }).then(curr => {
                                                temp['username'] = curr['username'];
                                                services.push(temp);

                                                if (i == favs.length - 1) {
                                                    setTimeout(() => {
                                                        res.render('profile/', {
                                                            projects: projects,
                                                            user: user,
                                                            services: services,
                                                            skills: skills,
                                                            social_medias: socialmedias,
                                                            favs: favs
                                                        });
                                                    }, 50);
                                                }
                                            })
                                        }
                                    }
                                    else {
                                        res.render('profile/', {
                                            projects: projects,
                                            user: user,
                                            services: services,
                                            skills: skills,
                                            social_medias: socialmedias
                                        });

                                    }
                                })
                            }
                            else {
                                console.log("render else")
                                res.render('profile/viewProfile', {
                                    projects: projects,
                                    user: user,
                                    services: services,
                                    skills: skills
                                });

                            }


                        }).catch(err => console.log(err))

                    })

                })
            })
        }

    },


    editProfile: function (req, res) {
        countryList = countries.countries

        User.findOne({
            where: {
                id: req.user.id
            }
        }).then((user) => {

            if (user.skills != null) {
                skills = user.skills.split(',')
                removeEmpty(skills, '', skills.length)
                removeEmpty(skills, ' ', skills.length)
            }
            else {
                skills = []
            }
            res.render("profile/editProfile", {
                user: user,
                countryList: countryList,
                skills: skills
            })

        })

    },
    editProfilePost: function (req, res) {
        base64StringImg = req.body.imgString
        let base64Image = base64StringImg.split(';base64,').pop();

        base64StringBanner = req.body.bannerString
        let base64Banner = base64StringBanner.split(';base64,').pop();
        website = req.body.website
        dob = moment(req.body.dob, 'DD/MM/YYYY')
        gender = req.body.gender
        location = req.body.location
        occupation = req.body.occupation

        paypal = req.body.paypal
        socialmedias = "" + req.body.twitter + "," + req.body.instagram + "," + req.body.facebook + "," + req.body.youtube + "," + req.body.deviantart

        skill1 = req.body.skill1
        skill2 = req.body.skill2
        skill3 = req.body.skill3
        skill4 = req.body.skill4
        skill5 = req.body.skill5
        skills = "" + skill1 + "," + skill2 + "," + skill3 + "," + skill4 + "," + skill5
        bio = req.body.bio

        User.update({
            website: website,
            dob: dob,
            gender: gender,
            location: location,
            occupation: occupation,
            skills: skills,
            bio: bio,
            paypal: paypal,
            social_media: socialmedias
        },
            {
                where: {
                    id: req.user.id
                }
            }).then((user) => {
                if (!fs.existsSync('./public/uploads/profile/' + req.user.id)) {
                    fs.mkdirSync('./public/uploads/profile/' + req.user.id);
                }

                //Changes Base64 to PNG
                if (base64Image !== "") {
                    fs.writeFile('./public/uploads/profile/' + req.user.id + '/profilePic.png', base64Image, { encoding: 'base64' }, function (err) {
                    });
                }
                if (base64Banner !== "") {
                    fs.writeFile('./public/uploads/profile/' + req.user.id + '/banner.png', base64Banner, { encoding: 'base64' }, function (err) {
                    });
                }

                res.redirect('/profile/')
            })

    },


    submit: function (req, res) {


        fonts = [
            "Arial", "Calibri", "Impact", "Courier", "Helvetica", "Times New Roman", "Verdana",
            //"Segoe UI", "Helvetica Neue", "Noto Sans", "Courier New", "Garamond", "Roboto",
        ]
        fonts.sort()

        res.render('profile/submitProjects', {
            fonts: fonts
        })
    },

    submitProject: function (req, res) {
        uid = req.user.id
        title = req.body.title
        category = req.body.projectCategory.toString()
        content = req.body.content
        datePosted = new Date()
        views = 0
        likes = 0

        Project.create({
            uid: uid,
            title: title,
            category: category,
            content: content,
            datePosted: datePosted,
            views: views,
            likes: likes

        })
            .then((projects) => {
                if (req.file !== undefined) {
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id)) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id);
                    }

                    // Creates user id directory for upload if not exist
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id + '/projects/')) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id + '/projects/');
                    }

                    // Move file
                    let projectsId = projects.id;
                    fs.renameSync(req.file['path'], './public/uploads/profile/' + req.user.id + '/projects/' + projectsId + '.png');
                }



                res.redirect('/profile/');
            })
            .catch(err => console.log(err))

    },
    viewProject: function (req, res) {
        Project.findOne({
            where: {
                id: req.params.id
            }

        })
            .then((project) => {

                User.findOne({
                    where: {
                        id: project.uid
                    }

                }).then((user) => {

                    Services.findAll({
                        where: {
                            uid: project.uid
                        }

                    }).then(((services) => {
                        res.render('profile/viewProject', {
                            project: project,
                            services: services,
                            user: user
                        })
                    }))


                })
            })

    },
    deleteProject: function (req, res) {
        Project.findOne({
            id: req.params.id,
            uid: req.user.id
        }).then((project) => {
            if (project == null) {
                res.redirect('/')
            }
            else {
                Project.destroy({
                    where:
                    {
                        id: req.params.id
                    }
                })
                    .then((project) => {
                        req.flash('success', ['Project successfully deleted!'])
                        res.redirect('/profile')
                    })
            }
        })
    },

}