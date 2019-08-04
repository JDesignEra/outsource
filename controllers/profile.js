Project = require('../models/portfolio')
User = require('../models/users')
Services = require('../models/services')
Servicefavs = require('../models/servicesfav')
Notification = require('../models/notifications')
Comments = require('../models/portfolioComments')


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

            followers = user && user.followers !== null ? user.followers.split(',') : [];
            following = user && user.following !== null ? user.following.split(',') : [];
            socialmedias = user && user.social_media !== null ? socialmedias = user.social_media.split(',') : []

            if (user.skills != null) {
                skills = user.skills.split(',')
                removeEmpty(skills, '', skills.length)
                removeEmpty(skills, ' ', skills.length)
            }
            else {
                skills = []
            }

            //Finds all user projects
            Project.findAll({
                where: {
                    uid: req.user.id
                },
                order: [['datePosted', 'DESC']]
            }).then((projects) => {
                //Finds all user services
                Services.findAll({
                    where: {
                        uid: req.user.id
                    }
                }).then((services) => {
                    //Finds all Followers
                    User.findAll({
                        where: {
                            id: {
                                [Op.in]: followers
                            }
                        }
                    }).then(followers => {
                        //Finds all Following
                        User.findAll({
                            where: {
                                id: {
                                    [Op.in]: following
                                }
                            }
                        }).then(following => {
                            Project.findAll(
                            ).then(likedProject => {
                                liked = []
                                for (i = 0; i < likedProject.length; i++) {
                                    likes = likedProject[i].likes !== null ? likes = likedProject[i].likes.split(',') : []

                                    if (likes.includes(req.user.id.toString())) {
                                        liked.push(likedProject[i])
                                    }
                                }
                                liked.reverse()
                                projectIDs = []
                                for (i = 0; i < projects.length; i++) {
                                    projectIDs.push(projects[i].id)
                                }
                                likedProjectIDs = []
                                likedProjectUIDs = []
                                for (i = 0; i < liked.length; i++) {
                                    likedProjectIDs.push(liked[i].id)
                                    likedProjectUIDs.push(liked[i].uid)
                                }

                                //Comments for self Portfolio
                                Comments.findAll({
                                    where: { pid: { [Op.in]: projectIDs } }
                                }).then(projectComments => {
                                    for (a = 0; a < projects.length; a++) {
                                        projects[a].comments = []
                                        for (c = 0; c < projectComments.length; c++) {
                                            if (projects[a].id == projectComments[c].pid) {
                                                projects[a].comments.push(projectComments[c])
                                            }
                                        }
                                        projects[a].comments.reverse()
                                    }

                                    //Comments for liked Portfolio
                                    Comments.findAll({
                                        where: { pid: { [Op.in]: likedProjectIDs } }
                                    }).then(likedProjectComments => {
                                        for (a = 0; a < liked.length; a++) {

                                            liked[a].comments = []
                                            for (c = 0; c < likedProjectComments.length; c++) {
                                                if (liked[a].id == likedProjectComments[c].pid) {
                                                    liked[a].comments.push(likedProjectComments[c])
                                                }
                                            }
                                            liked[a].comments.reverse()
                                        }

                                        //Getting username for liked Portfolio
                                        User.findAll({
                                            where: { id: { [Op.in]: likedProjectUIDs } }
                                        }).then(likedProjectUser => {
                                            for (a = 0; a < liked.length; a++) {
                                                for (c = 0; c < likedProjectUser.length; c++) {
                                                    if (liked[a].uid == likedProjectUser[c].id) {

                                                        liked[a].username = likedProjectUser[c].username
                                                    }
                                                }
                                            }

                                            //Getting liked portfolio user services
                                            Services.findAll(
                                            ).then(likedProjectService => {
                                                for (p = 0; p < liked.length; p++) {
                                                    liked[p].services = []
                                                    for (s = 0; s < likedProjectService.length; s++) {
                                                        if (liked[p].uid == likedProjectService[s].uid) {
                                                            liked[p].services.push(likedProjectService[s])
                                                        }
                                                    }
                                                    liked[p].services.reverse()
                                                }

                                                //Getting user favourites ID
                                                Servicefavs.findAll({
                                                    where: {
                                                        uid: req.user.id
                                                    }
                                                }).then((datas) => {
                                                    let serviceIds = [];

                                                    for (const data of datas) {
                                                        serviceIds.push(data['sid']);
                                                    }
                                                    //Getting user favourites using the ID
                                                    Services.findAll({
                                                        where: {
                                                            id: { [Op.in]: serviceIds },
                                                        }
                                                    }).then(favs => {
                                                        res.render('profile/', {
                                                            user: user,
                                                            followers: followers,
                                                            following: following,
                                                            skills: skills,
                                                            social_medias: socialmedias,

                                                            projects: projects,
                                                            open: req.params.open,

                                                            services: services,

                                                            favs: favs,

                                                            liked
                                                        });
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
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
                    viewUserFollowers = req.user && req.user.following != null ? viewUserFollowers = req.user.following.split(',') : []
                    followedUser = viewUserFollowers.includes(viewuser.id.toString()) ? true : false

                    //Checks if user skill is null
                    if (viewuser.skills != null) {
                        skills = viewuser.skills.split(',')
                        removeEmpty(skills, '', skills.length)
                        removeEmpty(skills, ' ', skills.length)
                    }
                    else {
                        skills = []
                    }

                    socialmedias = viewuser.social_media != null ? viewuser.social_media.split(',') : []
                    followers = viewuser.followers != null ? viewuser.followers.split(',') : []
                    following = viewuser.following != null ? viewuser.following.split(',') : []


                    //Finds all projects of view user
                    Project.findAll({
                        where: {
                            uid: viewuser.id
                        },
                        order: [['datePosted', 'DESC']]
                    }).then((projects) => {

                        projectIDs = []
                        for (i = 0; i < projects.length; i++) {
                            projectIDs.push(projects[i].id)
                        }

                        //Finds all services of view user
                        Services.findAll({
                            where: {
                                uid: viewuser.id
                            }
                        }).then((services) => {
                            //Finds all followers of view user
                            User.findAll({
                                where: {
                                    id: {
                                        [Op.in]: followers
                                    }
                                }
                            }).then(followers => {
                                //Finds all following of view user
                                User.findAll({
                                    where: {
                                        id: {
                                            [Op.in]: following
                                        }
                                    }
                                }).then(following => {
                                    //Finds liked project of view user
                                    Project.findAll(
                                    ).then(likedProject => {
                                        liked = []
                                        for (i = 0; i < likedProject.length; i++) {
                                            likes = likedProject[i].likes != null ? likedProject[i].likes.split(',') : []

                                            if (likes.includes(req.params.id.toString())) {
                                                liked.push(likedProject[i])
                                            }

                                        }

                                        liked.reverse()

                                        likedProjectIDs = []
                                        likedProjectUIDs = []

                                        for (i = 0; i < liked.length; i++) {
                                            likedProjectIDs.push(liked[i].id)
                                            likedProjectUIDs.push(liked[i].uid)
                                        }

                                        //Find comments for view user projects
                                        Comments.findAll({
                                            where: { pid: { [Op.in]: projectIDs } }
                                        }).then(projectComments => {
                                            for (a = 0; a < projects.length; a++) {
                                                projects[a].comments = []
                                                for (c = 0; c < projectComments.length; c++) {
                                                    if (projects[a].id == projectComments[c].pid) {
                                                        projects[a].comments.push(projectComments[c]);
                                                    }
                                                }

                                                projects[a].comments.reverse();
                                            }

                                            //Comments for view user liked Portfolio
                                            Comments.findAll({
                                                where: { pid: { [Op.in]: likedProjectIDs } }
                                            }).then(likedProjectComments => {
                                                for (a = 0; a < liked.length; a++) {

                                                    liked[a].comments = []
                                                    for (c = 0; c < likedProjectComments.length; c++) {
                                                        if (liked[a].id == likedProjectComments[c].pid) {
                                                            liked[a].comments.push(likedProjectComments[c])
                                                        }
                                                    }
                                                    liked[a].comments.reverse()
                                                }
                                                //Getting username for liked Portfolio
                                                User.findAll({
                                                    where: { id: { [Op.in]: likedProjectUIDs } }
                                                }).then(likedProjectUser => {
                                                    for (a = 0; a < liked.length; a++) {
                                                        for (c = 0; c < likedProjectUser.length; c++) {
                                                            if (liked[a].uid == likedProjectUser[c].id) {
                                                                liked[a].username = likedProjectUser[c].username
                                                            }
                                                        }
                                                    }
                                                    //Getting liked portfolio user services
                                                    Services.findAll().then(likedProjectService => {
                                                        for (p = 0; p < liked.length; p++) {
                                                            liked[p].services = []
                                                            for (s = 0; s < likedProjectService.length; s++) {
                                                                if (liked[p].uid == likedProjectService[s].uid) {
                                                                    liked[p].services.push(likedProjectService[s])
                                                                }
                                                            }
                                                            liked[p].services.reverse()
                                                        }
                                                        Servicefavs.findAll({
                                                            where: {
                                                                uid: viewuser.id
                                                            }
                                                        }).then((datas) => {
                                                            let serviceIds = [];

                                                            for (const data of datas) {
                                                                serviceIds.push(data['sid']);
                                                            }

                                                            Services.findAll({
                                                                where: {
                                                                    id: { [Op.in]: serviceIds },
                                                                    uid: viewuser.id
                                                                }
                                                            }).then((favs) => {
                                                                res.render('profile/viewProfile', {
                                                                    viewuser: viewuser,
                                                                    followers: followers,
                                                                    following: following,
                                                                    followedUser: followedUser,
                                                                    social_medias: socialmedias,
                                                                    skills: skills,
                                                                    projects: projects,
                                                                    open: req.params.open,
                                                                    services: services,
                                                                    favs: favs,
                                                                    liked

                                                                });
                                                            });
                                                        }).catch(err => console.log(err));
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
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
                req.flash("success", "Changes successfully saved")
                res.redirect('/profile/')
            })

    },


    follow: function (req, res) {
        User.findOne({
            where: {
                id: req.params.id
            }
        }).then(followUser => {
            followers = followUser.followers != null ? followUser.followers.split(',') : []
            followers.push(req.user.id)

            following = followUser.following != null ? followUser.following.split(',') : []
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
                            Notification.findOne({
                                where: {
                                    uid: req.user.id,
                                    user: followUser.id,
                                    category: "Follow"
                                }
                            }).then(existNotif => {
                                if (existNotif != null) {
                                    res.redirect('back')
                                }
                                else {
                                    Notification.create({
                                        uid: req.user.id,
                                        username: req.user.username,
                                        pid: -1,
                                        title: "None",
                                        date: new Date(),
                                        category: "Follow",
                                        user: followUser.id
                                    })
                                    res.redirect('back')
                                }
                            })
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

    viewNotification: function (req, res) {
        Notification.findAll({
            where: {
                user: req.user.id,
                category: "Projects"
            },
            order: [['date', 'DESC']]
        }).then(project_notifications => {
            Notification.findAll({
                where: {
                    user: req.user.id,
                    category: "Likes"
                },
                order: [['date', 'DESC']]
            }).then(like_notifications => {
                Notification.findAll({
                    where: {
                        user: req.user.id,
                        category: "Services"
                    },
                    order: [['date', 'DESC']]
                }).then(service_notifications => {

                    Notification.findAll({
                        where: {
                            user: req.user.id,
                            category: "Comments"
                        },
                        order: [['date', 'DESC']]
                    }).then(comment_notifications => {

                        Notification.findAll({
                            where: {
                                user: req.user.id,
                                category: "Follow"
                            },
                            order: [['date', 'DESC']]
                        }).then(followers_notifications => {
                            Notification.findAll({
                                where: {
                                    user: req.user.id,
                                    category: "Jobs"
                                },
                                order: [['date', 'DESC']]
                            }).then(jobs_notifications => {
                                Notification.findAll({
                                    where: {
                                        user: req.user.id,
                                        category: "Requests"
                                    },
                                    order: [['date', 'DESC']]
                                }).then(requests_notifications => {


                                    Notification.findAll({
                                        where: {
                                            user: req.user.id,
                                            category: "Jobs_Reject"
                                        },
                                        order: [['date', 'DESC']]
                                    }).then(jobs_reject_notifications => {
                                        Notification.findAll({
                                            where: {
                                                user: req.user.id,
                                                category: "Requests_Cancel"
                                            },
                                            order: [['date', 'DESC']]
                                        }).then(requests_cancelled_notifications => {
                                            Notification.findAll({
                                                where: {
                                                    user: req.user.id,
                                                    category: "Complete_requests"
                                                },
                                                order: [['date', 'DESC']]
                                            }).then(complete_requests_notifications => {
                                                Notification.findAll({
                                                    where: {
                                                        user: req.user.id,
                                                        category: "Jobs_Paid"
                                                    }
                                                }).then(paid_jobs_notifications => {
                                                    Notification.findAll({
                                                        where: {
                                                            user: req.user.id,
                                                            category: "Share"
                                                        },
                                                        order: [['date', 'DESC']]
                                                    }).then(file_share_notifications => {
                                                        Notification.findAll({
                                                            where: {
                                                                user: req.user.id,
                                                                category: "Unshare"
                                                            },
                                                            order: [['date', 'DESC']]
                                                        }).then(file_unshare_notifications => {


                                                            res.render('profile/viewNotifications', {
                                                                project_notifications,
                                                                service_notifications,

                                                                like_notifications,
                                                                comment_notifications,
                                                                followers_notifications,

                                                                file_share_notifications,
                                                                file_unshare_notifications,

                                                                jobs_notifications,
                                                                requests_notifications,

                                                                jobs_reject_notifications,
                                                                requests_cancelled_notifications,

                                                                paid_jobs_notifications,
                                                                complete_requests_notifications
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })

            })
        })
    },

    deleteNotification: function (req, res) {
        Notification.destroy({
            where: { id: req.params.id }
        }).then(deleted => {
            res.redirect('back')
        })
    },

    deleteAllNotification: function (req, res) {
        Notification.destroy({
            where: {
                user: req.user.id,
                category: req.params.category.toString()
            }
        }).then(deleted => {
            res.redirect('back')
        })
    },

    //View Projects

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

            if (likedProject.likes != null) {
                likers = likedProject.likes.split(',')
                removeEmpty(likers, '', likers.length)
                removeEmpty(likers, ' ', likers.length)
            }
            else {
                likers = []
            }
            likers.push(req.user.id)

            Project.update({
                likes: likers.toString()
            }, {
                    where: { id: likedProject.id }
                }).then(likedProjectSaved => {
                    Notification.findOne({
                        where: {
                            uid: req.user.id,
                            pid: likedProject.id
                        }
                    }).then(existNotif => {
                        if (existNotif != null) {
                            res.redirect('back')
                        }
                        else {
                            Notification.create({
                                uid: req.user.id,
                                username: req.user.username,
                                pid: likedProject.id,
                                title: likedProject.title,
                                date: new Date(),
                                category: "Likes",
                                user: likedProject.uid
                            })
                            res.redirect('back')
                        }
                    })

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

            likerIndex = likers.indexOf(req.user.id.toString())
            if (likerIndex > -1) {
                likers.splice(likerIndex, 1)
            }

            Project.update({
                likes: likers.toString()
            },
            {
                where: { id: likedProject.id }
            }).then(likedProject => {
                res.redirect('back')
            });
        })
    },
    //Comment system
    postComment: function (req, res) {
        Comments.create({
            uid: req.user.id,
            username: req.user.username,
            content: req.body.commentContent,
            pid: req.params.projectID,
            date: new Date()
        }).then(comment => {
            Project.findOne({
                where: { id: req.params.projectID }
            }).then(commentedProject => {
                if (commentedProject.uid != req.user.id) {
                    Notification.create({
                        uid: req.user.id,
                        username: req.user.username,
                        pid: req.params.projectID,
                        title: commentedProject.title,
                        date: new Date(),
                        category: "Comments",
                        user: commentedProject.uid
                    });
                }

                res.redirect('back');
            });
        });
    },
    //Projects
    submit: function (req, res) {
        res.render('profile/submitProjects', {
            fonts: fonts
        });
    },
    submitProject: function (req, res) {
        let uid = req.user.id
        let title = req.body.title
        let category = req.body.projectCategory.toString()
        let content = req.body.content
        let datePosted = new Date()
        let views = 0
        let imgfile = req.file

        Project.create({
            uid: uid,
            title: title,
            category: category,
            content: content,
            datePosted: datePosted,
            views: views,
        }).then((projects) => {
            //Saves image file to folder
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


            //Notifies users
            if (req.user.followers != null && req.user.followers.split(',').length > 0) {
                follower = req.user.followers.split(',');

                for (i = 0; i < follower.length; i++) {
                    follower[i] = parseInt(follower[i])
                }
                
                User.findAll({
                    where: {
                        id: { [Op.in]: follower }
                    }
                }).then(followerUser => {
                    for (i = 0; i < follower.length; i++) {
                        Notification.create({
                            uid: req.user.id,
                            username: req.user.username,
                            pid: projects.id,
                            title: projects.title,
                            date: projects.datePosted,
                            category: "Projects",
                            user: followerUser[i].id
                        })
                    }
                    res.redirect('/profile/');
                })
            }
            else {
                res.redirect('/profile/');
            }
        }).catch(err => console.log(err));

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
                });
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
            }).then((updateProject) => {
                if (coverimg !== undefined) {
                    // Creates user id directory for upload if not exist
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id)) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id);
                    }
                    if (!fs.existsSync('./public/uploads/profile/' + req.user.id + '/projects/')) {
                        fs.mkdirSync('./public/uploads/profile/' + req.user.id + '/projects/');
                    }

                    // Move/Replace file
                    let newPath = `./public/uploads/profile/${req.user.id}/projects/${req.params.id}.png`
                    fs.renameSync(coverimg['path'], newPath);
                }

                res.redirect('/profile/');
            }).catch(err => console.log(err));


    },
    viewProject: function (req, res) {
        Project.findOne({
            where: {
                id: req.params.id
            }
        }).then((project) => {
            User.findOne({
                where: {
                    id: project.uid
                }
            }).then((user) => {
                Services.findAll({
                    where: {
                        uid: project.uid
                    }

                }).then((services) => {
                    res.render('profile/viewProject', {
                        project: project,
                        services: services,
                        user: user
                    });
                });
            });
        });

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
                }).then((project) => {
                    req.flash('success', ['Project successfully deleted!'])
                    res.redirect('/profile')
                });
            }
        })
    },
}