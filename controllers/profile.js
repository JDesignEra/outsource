Project = require('../models/portfolio')
User = require('../models/users')
Services = require('../models/services')
fs = require('fs')
countries = require('countries-list')
fontList = require('font-list')
const moment = require('moment');


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

            if (user.qskills != null) {
                skills = user.skills.split(',')
                removeEmpty(skills, '', skills.length)
                removeEmpty(skills, ' ', skills.length)
            }
            else {
                skills = []
            }

            Project.findAll({
                where: {
                    uid: req.user.id
                },
            }).then((projects) => {

                Services.findAll({
                    where: {
                        uid: req.user.id
                    }
                }).then((services) => {
                    console.log(services)
                    res.render('profile/index', {
                        projects: projects,
                        user: user,
                        services: services,
                        skills: skills
                        //services2: services
                    });
                })

            })
        })


    },
    editProfile: function (req, res) {
        countryList = countries.countries

        User.findOne({
            where: {
                id: req.user.id
            }
        }).then((user) => {

            if (user.qskills != null) {
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
        website = req.body.website
        dob = moment(req.body.dob, 'DD/MM/YYYY')
        gender = req.body.gender
        location = req.body.location
        occupation = req.body.occupation
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
        },
            {
                where: {
                    id: req.user.id
                }
            }).then((user) => {
                res.redirect('/profile/')
            })

    },



    submit: function (req, res) {
        // fonts = ["Arial", "Calibri", "Courier", "Courier New", "Georgia",
        //     "Helvetica", "Times New Roman", "Verdana", "Palatino", "Garamond", "Bookman", "Comic Sans MS", "Trebuchet MS", "Impact", "Arial Black"]
        // fonts.sort()
        fontList.getFonts()
            .then(fonts => {
                res.render('profile/submitProjects', {
                    fonts: fonts
                })
            }).catch(err => {
                console.log(err)
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
                        res.redirect('/profile')
                    })
            }
        })
    },

}