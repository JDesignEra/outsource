Project = require('../models/portfolio')
User = require('../models/users')
Services = require('../models/services')
Servicefavs = require('../models/servicesfav')

fs = require('fs')
countries = require('countries-list')
moment = require('moment');
Op = require('sequelize').Op
// sequelize = require('sequelize')


fonts = [
    "Arial", "Calibri", "Impact", "Courier", "Helvetica", "Times New Roman", "Verdana",
]
fonts.sort()


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
            console.log(typeof user);
            console.log(typeof user.followers);
            followers = user && typeof user.followers !== 'undefined' ? user.followers.toString().split(',') : [];

            following = user && typeof user.following !== 'undefined' ? user.following.toString().split(',') : [];


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
                removeEmpty(socialmedias, '', socialmedias.length)
                removeEmpty(socialmedias, ' ', socialmedias.length)
                // removeEmpty(socialmedias , "", socialmedias.length)
            }
            else {
                socialmedias = []
            }
            // console.log(socialmedias)

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
                    User.findAll({
                        where: {
                            id: {
                                [Op.in]: followers
                            }
                        }
                    }).then(followers => {
                        User.findAll({
                            where: {
                                id: {
                                    [Op.in]: following
                                }
                            }
                        }).then(following => {


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
                                    }).then(favs => {

                                        if (favs.length > 0) {
                                            for (const [i, service] of favs.entries()) {
                                                let temp = service;

                                                User.findOne({
                                                    where: {
                                                        id: service.uid
                                                    },
                                                    attributes: ['username']
                                                }).then(curr => {
                                                    temp['username'] = curr['username'];

                                                    if (i == favs.length - 1) {
                                                        setTimeout(() => {
                                                            res.render('profile/', {
                                                                projects: projects,
                                                                user: user,
                                                                followers: followers,
                                                                following: following,
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
                                                followers: followers,
                                                following: following,
                                                services: services,
                                                skills: skills,
                                                social_medias: socialmedias
                                            });
                                        }
                                    })

                                }
                                else {
                                    console.log("else")
                                    res.render('profile/', {
                                        projects: projects,
                                        user: user,
                                        followers: followers,
                                        following: following,
                                        services: services,
                                        skills: skills,
                                        social_medias: socialmedias
                                    });

                                }


                            })
                        })
                    })


                })

            })
        })


    },

    viewProfile: function (req, res) {
        if (req.user && req.user.id == req.params.id) {
            res.redirect('/profile/')
        }
        else {
            User.findOne({
                where: {
                    id: req.params.id
                }
            }).then((viewuser) => {
                if (viewuser !== null) {

                    //Checks if user is followed
                    if (req.user && req.user.following != null) {
                        viewUserFollowers = req.user.following.split(',')
                        removeEmpty(viewUserFollowers, '', viewUserFollowers.length)
                        removeEmpty(viewUserFollowers, ' ', viewUserFollowers.length)
                    }
                    else {
                        viewUserFollowers = []
                    }

                    followedUser = false
                    if (viewUserFollowers.includes(viewuser.id.toString())) {
                        followedUser = true
                    }

                    //Checks if user skill is null
                    if (viewuser.skills != null) {
                        skills = viewuser.skills.split(',')
                        removeEmpty(skills, '', skills.length)
                        removeEmpty(skills, ' ', skills.length)
                    }
                    else {
                        skills = []
                    }

                    //Checks if user social media is null
                    if (viewuser.social_media != null) {
                        socialmedias = viewuser.social_media.split(',')
                        removeEmpty(socialmedias, '', socialmedias.length)
                        removeEmpty(socialmedias, ' ', socialmedias.length)
                    }
                    else {
                        socialmedias = []
                    }

                    //Gets the viewed user followers and following
                    if (viewuser.followers != null) {
                        followers = viewuser.followers.split(',')
                        removeEmpty(followers, '', followers.length)
                        removeEmpty(followers, ' ', followers.length)
                    }
                    else {
                        followers = []
                    }

                    if (viewuser.following != null) {
                        following = viewuser.following.split(',')
                        removeEmpty(following, '', following.length)
                        removeEmpty(following, ' ', following.length)
                    }
                    else {
                        following = []
                    }

                    Project.findAll({
                        where: {
                            uid: viewuser.id
                        },
                        order: [['datePosted', 'DESC']]
                    }).then((projects) => {
                        Services.findAll({
                            where: {
                                uid: viewuser.id
                            }
                        }).then((services) => {
                            User.findAll({
                                where: {
                                    id: {
                                        [Op.in]: followers
                                    }
                                }
                            }).then(followers => {
                                User.findAll({
                                    where: {
                                        id: {
                                            [Op.in]: following
                                        }
                                    }
                                }).then(following => {
                                    Servicefavs.findAll({
                                        where: {
                                            uid: viewuser.id
                                        }
                                    }).then((datas) => {
                                        let serviceIds = [];

                                        for (const data of datas) {
                                            serviceIds.push(data['sid']);
                                        }
                                        if (datas) {
                                            Services.findAll({
                                                where: {
                                                    id: { [Op.in]: serviceIds },
                                                    uid: viewuser.id
                                                }
                                            }).then((favs) => {

                                                res.render('profile/viewProfile', {
                                                    followedUser: followedUser,
                                                    projects: projects,
                                                    viewuser: viewuser,
                                                    followers: followers,
                                                    following: following,
                                                    social_medias: socialmedias,
                                                    services: services,
                                                    skills: skills,
                                                    favs: favs,

                                                });
                                            })
                                        }
                                        else {
                                            res.render('profile/viewProfile', {
                                                followedUser: followedUser,
                                                projects: projects,
                                                user: user,
                                                followers: followers,
                                                following: following,
                                                services: services,
                                                skills: skills,
                                                social_medias: socialmedias

                                            });
                                        }
                                    }).catch(err => console.log(err))

                                })

                            })
                        })

                    })
                }

                else {
                    req.flash('error', "This user does not exist.")
                    res.redirect('/')
                }
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
        let base64StringImg = req.body.imgString
        let base64Image = base64StringImg.split(';base64,').pop();

        let base64StringBanner = req.body.bannerString
        let base64Banner = base64StringBanner.split(';base64,').pop();
        let website = req.body.website
        let dob = req.body.dob
        let gender = req.body.gender
        let location = req.body.location
        let occupation = req.body.occupation

        let paypal = req.body.paypal
        let socialmedias = "" + req.body.twitter + "," + req.body.instagram + "," + req.body.facebook + "," + req.body.youtube + "," + req.body.deviantart

        let skill1 = req.body.skill1
        let skill2 = req.body.skill2
        let skill3 = req.body.skill3
        let skill4 = req.body.skill4
        let skill5 = req.body.skill5
        let skills = "" + skill1 + "," + skill2 + "," + skill3 + "," + skill4 + "," + skill5
        let bio = req.body.bio
        // res.send(dob)
        if (dob == "") {
            console.log("if")

            updates = {
                website: website,
                gender: gender,
                location: location,
                occupation: occupation,
                skills: skills,
                bio: bio,
                paypal: paypal,
                social_media: socialmedias
            }
        }
        else {
            console.log("else")
            updates = {
                website: website,
                dob: moment(dob, 'DD/MM/YYYY'),
                gender: gender,
                location: location,
                occupation: occupation,
                skills: skills,
                bio: bio,
                paypal: paypal,
                social_media: socialmedias
            }
        }

        // res.send(updates)
        User.update(
            updates
            ,
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

    follow: function (req, res) {
        console.log(req.params)
        User.findOne({
            where: {
                id: req.params.id
            }
        }).then(followUser => {
            followers = []
            if (followUser.followers != null) {
                followers = followUser.followers.split(',')
                removeEmpty(followers, '', followers.length)
                removeEmpty(followers, ' ', followers.length)
            }
            followers.push(req.user.id)

            following = []
            if (followUser.following != null) {
                following = followUser.following.split(',')
                removeEmpty(following, '', following.length)
                removeEmpty(following, ' ', following.length)
            }
            following.push(followUser.id)


            User.update({
                followers: followers.toString()
            },
                {
                    where: {
                        id: followUser.id
                    }
                }).then(followedUser => {
                    User.update({
                        following: following.toString()
                    }, {
                            where:
                            {
                                id: req.user.id
                            }
                        }).then(selfUser => {
                            res.redirect('back')
                        })

                })

        })
    },
    unfollow: function (req, res) {
        selfUserFollowing = req.user.following.split(',')
        if (selfUserFollowing.length > 0) {
            //Deletes User from Following
            followedUserIndex = selfUserFollowing.indexOf(req.params.id.toString())
            if (followedUserIndex > -1) {
                selfUserFollowing.splice(followedUserIndex, 1)
            }

            User.update({
                following: selfUserFollowing.toString()
            }, { where: { id: req.user.id } })
                .then(selfUser => {
                    User.findOne({
                        where: {
                            id: req.params.id
                        }
                    }).then(followedUser => {


                        followedUserFollowers = followedUser.followers.split(",")
                        // res.send(followedUserFollowers)
                        selfUserIndex = followedUserFollowers.indexOf(req.user.id.toString())
                        if (selfUserIndex > -1) {
                            followedUserFollowers.splice(selfUserIndex, 1)
                        }

                        User.update({
                            followers: followedUserFollowers.toString()
                        },
                            {
                                where: { id: followedUser.id }
                            }).then(unfollowedUser => {
                                res.redirect('back')
                            })
                    })
                })



        }
        else {
            req.flash('error', "You are not following anyone.")
            res.redirect('/')
        }
    },

    viewProjectUpdate: function (req, res) {
        Project.findOne({
            where: { id: req.params.id }
        }).then(viewedProject => {
            views = viewedProject.views
            Project.update({
                views: (views + 1)
            }, {
                    where: { id: viewedProject.id }
                }).then(viewedProject => {
                    res.redirect('back')
                })
        })
    },

    likeProject: function (req, res) {
        Project.findOne({
            where: { id: req.params.id }
        }).then(likedProject => {
            likers = []
            if (likedProject.likes.split(',') != null) {
                likers = likedProject.likes.split(',')
                removeEmpty(likers, '', likers.length)
                removeEmpty(likers, ' ', likers.length)
            }
            likers.push(req.user.id)

            Project.update({
                likes: likers.toString()
            }, {
                    where: { id: likedProject.id }
                }).then(likedProject => {
                    res.redirect('back')
                })
        })
    },

    unlikeProject: function (req, res) {
        Project.findOne({
            where: { id: req.params.id }
        }).then(likedProject => {

            //Retrieves likes as array
            if (likedProject.likes != null) {
                likers = likedProject.likes.split(',')
                removeEmpty(likers, '', likers.length)
                removeEmpty(likers, ' ', likers.length)
            }
            else {
                likers = []
            }
            console.log(likers)

            likerIndex = likers.indexOf(req.user.id.toString())
            if (likerIndex > -1) {
                likers.splice(likerIndex, 1)
            }

            Project.update({
                likes: likers.toString()
            }, {
                    where: { id: likedProject.id }
                }).then(likedProject => {
                    res.redirect('back')
                })
        })
    },

    submit: function (req, res) {
        res.render('profile/submitProjects', {
            fonts: fonts
        })
    },

    submitProject: function (req, res) {
        let uid = req.user.id
        let title = req.body.title
        let category = req.body.projectCategory.toString()
        let content = req.body.content
        let datePosted = new Date()
        let views = 0
        // let likes = 0
        let imgfile = req.file
        Project.create({
            uid: uid,
            title: title,
            category: category,
            content: content,
            datePosted: datePosted,
            views: views,
            // likes: likes

        })
            .then((projects) => {
                if (imgfile !== undefined) {
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id)) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id);
                    }

                    // Creates user id directory for upload if not exist
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id + '/projects/')) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id + '/projects/');
                    }

                    // Move file
                    let projectsId = projects.id;
                    fs.renameSync(imgfile['path'], './public/uploads/profile/' + req.user.id + '/projects/' + projectsId + '.png');
                }



                res.redirect('/profile/');
            })
            .catch(err => console.log(err))

    },

    editProject: function (req, res) {
        Project.findOne({
            where: {
                id: req.params.id,
            }
        }).then((project) => {
            if (project.uid != req.user.id) {
                req.flash('error', `You can't edit this project`)
                res.redirect("/")
            }
            else {
                let imgPath = `/uploads/profile/${req.user.id}/projects/${project.id}.png`;

                res.render('profile/editProject', {
                    fonts: fonts,
                    project,
                    img: imgPath
                })
            }
        })

    },

    editProjectPost: function (req, res) {

        let uid = req.user.id
        let title = req.body.title
        let category = req.body.projectCategory.toString()
        let content = req.body.content
        let datePosted = new Date()
        let coverimg = req.file
        Project.update(
            {
                uid: uid,
                title: title,
                category: category,
                content: content,
                datePosted: datePosted,

            },
            {
                where: {
                    id: req.params.id
                }
            })

            .then((updateProject) => {
                // console.log(req.user.id)
                // res.send("hi")
                // res.send(updateProject)
                if (coverimg !== undefined) {

                    // Creates user id directory for upload if not exist
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id)) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id);
                    }
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id + '/projects/')) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id + '/projects/');
                    }

                    // Move/Replace file
                    // let projectId = project.id;
                    let newPath = `./public/uploads/profile/${req.user.id}/projects/${req.params.id}.png`
                    console.log(newPath)
                    fs.renameSync(coverimg['path'], newPath);
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