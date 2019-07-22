const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const express = require("express");
const router = express.Router();
const async = require("async");
const crypto = require("crypto");
const email = require('../helpers/email');
const Op = require('sequelize').Op;

module.exports = {
    logout: function (req, res) {
        req.logout();
        req.flash('success', 'You have sign out successfully.');
        res.redirect('/');
    },
    login: function (req, res, next) {
        if (req.method === 'GET') {
            res.render('auth/login');
        }
        else if (req.method === 'POST') {
            passport.authenticate('local', {
                successRedirect: '/',
                successFlash: 'You have sign in successfully.',
                failureRedirect: '/',
                failureFlash: 'Invalid sign in credentials.'
            })(req, res, next);
        }
    },
    register: function (req, res) {
        if (req.method === 'GET') {
            res.render('auth/register');
        }
        else if (req.method === 'POST') {
            let errors = {};
            let { username, email, password, cfmPassword, accType } = req.body;

            if (username == '') {
                errors['username'] = 'Username is required.'
            }

            if (email == '') {
                errors['email'] = 'Email is required.'
            }

            if (password == '') {
                errors['password'] = 'Password is required.'
            }
            else if (password.length < 8) {
                errors['password'] = 'Password must be at least 8 characters.'
            }

            if (password != cfmPassword) {
                errors['cfmPassword'] = 'Passwords and Confirm Password do not match.';
            }

            if (Object.getOwnPropertyNames(errors).length > 0) {
                req.flash('forms', { errors: errors });

                res.redirect('/register');
                // return res.render('auth/register', {
                //     username,
                //     email,
                //     password,
                //     cfmPassword,
                //     errors
                // });
            }
            else {
                if (Object.keys(errors).length > 0) {
                    req.flash('forms', { errors: errors });
                    res.redirect('/register');
                }
                else {
                    User.findOne({
                        where: { username: req.body.username }
                    }).then(user => {
                        if (user) {
                            req.flash('forms', {
                                errors: {
                                    username: `${user.username} is already registered.`
                                },
                                username: username,
                                email: email,
                                password: password,
                                cfmPassword: cfmPassword
                            });

                            res.redirect('/register');
                        }
                        else {
                            User.findOne({ where: { email: req.body.email } })
                                .then(user => {
                                    if (user) {
                                        req.flash('forms', {
                                            errors: {
                                                email: user.email + ' is already registered.'
                                            },
                                            username: username,
                                            email: email,
                                            password: password,
                                            cfmPassword: cfmPassword
                                        });

                                        res.redirect('/register');

                                        // res.render('auth/register', {
                                        //     errors: {
                                        //         'email': user.email + ' is already registered.'
                                        //     },
                                        //     username,
                                        //     email,
                                        //     password,
                                        //     cfmPassword
                                        // });
                                    }
                                    else {
                                        bcrypt.genSalt(10, (err, salt) => {
                                            bcrypt.hash(password, salt, (err, hash) => {
                                                User.create({
                                                    username: username,
                                                    email: email,
                                                    password: hash,
                                                    accType: accType,
                                                    followers: 0,
                                                    following: 0,

                                                }).then(user => {
                                                    req.flash('success', user.username + ' register successfully. You may login now.');
                                                    res.redirect('./');
                                                }).catch(err => console.log(err))
                                            });
                                        });
                                        // bcrypt.genSalt(10, function (err, salt) {
                                        //     bcrypt.hash(password, salt, function (err, hash) {
                                        //         password = bcrypt.hashSync(password, salt)

                                        //         User.create({
                                        //             username: username,
                                        //             email,
                                        //             password,
                                        //             accType,
                                        //             followers: 0,
                                        //             following: 0,

                                        //         }).then(user => {
                                        //             req.flash('success', user.username + ' register successfully. You may login now.');
                                        //             res.redirect('./');
                                        //         }).catch(err => console.log(err));
                                        //     });
                                        // });
                                    }
                                });
                        }
                    });
                }
            }
        }
    },
    forgot: function (req, res) {
        if (req.method === 'GET') {
            res.render('auth/forgot');
        }
        else if (req.method === 'POST') {
            let token = crypto.randomBytes(20).toString('hex');

            User.findOne({ where: { email: req.body.email } }).then(user => {
                if (user) {
                    user.update({
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + 3600000
                    });

                    let link = `http://${req.headers.host}/reset/${token}`;

                    email.send(
                        user.email,
                        'Outsource Password Reset',
                        `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>` +
                        `<p>Please click on the following link, or paste this into your browser to complete the process:<br>` +
                        `<a href="${link}">${link}</a></p>` +
                        `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
                    );
                    req.flash('success', 'A verification email has been sent to ' + user.email);
                }
                else {
                    req.flash('error', 'No account with that email address exists.');
                }

                res.redirect('/forgot');
            });
        }
    },
    reset: function (req, res) {
        console.log('reset');
        console.log(req.method);
        if (req.method === "GET") {
            console.log('resetget');
            res.render('auth/reset', { token: req.params.token });
        }
        else if (req.method === "POST") {
            let token = req.params.token;
            console.log(token);


            User.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: { [Op.gt]: Date.now() }
                }
            }).then(user => {
                if (!user) {
                    console.log('resetpost1');
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    res.redirect('back');
                }
                if (req.body.newpass === req.body.newconfirmpass && req.body.newpass.length > 8) {
                    console.log('resetpost1');
                    let password = req.body.newpass

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            user.update({
                                password: hash,
                                resetPasswordToken: token,
                                resetPasswordExpires: Date.now() + 36000
                            }).then(() => {
                                res.redirect('/');
                            });
                        });
                    });
                }
                 else if(req.body.newpass.length < 8) {
                    req.flash("error", "Passwords have to be at least 8 characters.");
                    res.redirect('back');
                }
                else if(req.body.newpass != req.body.newconfirmpass){
                    req.flash("error", "Passwords do not match.");
                    res.redirect('back');
                }
            });
            // User.findOne({
            //     where: {
            //         resetPasswordToken: req.params.token,
            //         resetPasswordExpires: { [Op.gt]: Date.now() }
            //     }
            // }, (user) => {
            //     if (!user) {
            //         console.log('resetpost1');
            //         req.flash('error', 'Password reset token is invalid or has expired.');
            //         return res.redirect('back');
            //     }
            //     if (req.body.newpass === req.body.newconfirmpass) {
            //         console.log('resetpost1');
            //         user.setPassword(req.body.newpass, function (done) {
            //             user.resetPasswordToken = token;
            //             user.resetPasswordExpires = Date.now + 36000;

            //             user.save(function (done) {
            //                 req.login(user, function (err) {
            //                     done(err, user);
            //                 });
            //             });
            //         })
            //     } else {
            //         req.flash("error", "Passwords do not match.");
            //         return res.redirect('auth/reset');
            //     }
            // });
        }
    },
    delete: function (req, res) {
        if (req.method === "GET") {
            User.findOne({
                id: req.params.id
            }).then((user) => {
                if (user == null) {
                    res.redirect('/')
                }
                else {
                    User.destroy({
                        where: {
                            id: req.params.id
                        }
                    })
                        .then((user) => {
                            console.log('destroy');
                            req.flash('success', 'Account successfully deleted!');
                            res.redirect('/')
                        })
                }
            })
        }
    },
    changepw: function (req, res) {
        if (req.method === "GET") {
            res.render('auth/changePw');
        }
    }
}