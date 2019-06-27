Project = require('../models/portfolio')
User = require('../models/users')
fs = require('fs')
countries = require('countries-list')
fontList = require('font-list')

module.exports = {
    index: function (req, res) {
        User.findOne({
            where: {
                id: req.user.id
            }
        }).then((user) => {
            Project.findAll({
                where: {
                    uid: req.user.id
                },
            }).then((projects) => {
                console.log(projects)
                res.render('profile/index', {
                    projects: projects,
                    user: user
                });
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
            res.render("profile/editProfile", {
                user: user,
                countryList: countryList
            })

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
                if (req.file === undefined) {
                    console.log("No imaged uploaded")
                }
                else {
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

    deleteProject: function (req, res){
        Port
    }
}