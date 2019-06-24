Project = require('../models/portfolio')

module.exports = {
    index: function (req, res) {
        Project.findOne({
            where: {
                id: 1
            },
        }).then((projects) => {
            res.render('profile/index', {
                projects: projects
            });
        })

    },



    submit: function (req, res) {
        res.render('profile/submitProjects')
    },


    submitProject: function (req, res) {
        title = req.body.title
        category = req.body.projectCategory.toString()
        content = req.body.content
        datePosted = new Date()
        views = 0
        likes = 0


        Project.create({
            name: title,
            category: category,
            rawDetails: content,
            datePosted: datePosted,
            views: views,
            likes: likes

        })
        .then((projects) => {
            res.redirect('/profile/');
        })
        .catch(err => console.log(err))

    }
}