const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const express = require("express");
const router = express.Router();
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
                res.render('auth/register', {
                    username,
                    email,
                    password,
                    cfmPassword,
                    errors
                });
            }
            else {
                User.findOne({ where: { email: req.body.email } })
                    .then(user => {
                        if (user) {
                            res.render('auth/register', {
                                errors: {
                                    'email': user.email + ' is already registered.'
                                },
                                username,
                                email,
                                password,
                                cfmPassword
                            });
                        }
                        else {
                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(password, salt, function (err, hash) {
                                    password = bcrypt.hashSync(password, salt)

                                    User.create({
                                        username: username,
                                        email,
                                        password,
                                        accType,
                                        followers: 0,
                                        following: 0,

                                    })
                                        .then(user => {
                                            req.flash('success', user.username + ' register successfully. You may login now.');
                                            res.redirect('./');
                                        })
                                        .catch(err => console.log(err));
                                });
                            });
                        }
                    });
            }
        }
    },
    forgot: function (req, res) {
        if (req.method === 'GET') {
            res.render('auth/forgot');
        }
        else if (req.method === 'POST') {
            console.log('posted');
            async.waterfall([
                function (done) {
                    console.log('inside post waterfall1');
                    crypto.randomBytes(20, function (err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function (token, done) {
                    User.findOne({ where: { email: req.body.email } })
                    .then(user => { 
                        if (!user) {
                            console.log('inside post waterfall3');
                            req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }

                        console.log('inside post waterfall4');
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                        
                       
                        user.save(function (err) {
                            done(err, token, user);
                            console.log("Save function");
                        });
                        console.log('test');
                    });
                },
                function (token, user, done) { //doesnt go into this function
                    console.log('inside post waterfall5');
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            type: 'OAuth2',
                            user: 'Outsourceforgotpw@gmail.com',
                            accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x'
                        }
                    });
                    
                    var mailOptions = {
                        to: user.email,
                        from: 'outsourceforgetpw@gmail.com',
                        subject: 'outsource Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    transporter.sendMail(mailOptions, function (err) {
                        console.log('mail sent');
                        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                        done(err, 'done');
                    });
                }
            ], function (err) {
                if (err) return next(err);
                res.redirect('/forgot');
            });
        }
    },
    reset: function (res, req) {
        if (req.method === "GET") {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/forgot');
                }
                res.render('reset', { token: req.params.token });
            });
        }
        else if (req.method === "POST") {
            async.waterfall([
                function (done) {
                    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                        if (!user) {
                            req.flash('error', 'Password reset token is invalid or has expired.');
                            return res.redirect('back');
                        }
                        if (req.body.password === req.body.confirm) {
                            user.setPassword(req.body.password, function (err) {
                                user.resetPasswordToken = undefined;
                                user.resetPasswordExpires = undefined;

                                user.save(function (err) {
                                    req.logIn(user, function (err) {
                                        done(err, user);
                                    });
                                });
                            })
                        } else {
                            req.flash("error", "Passwords do not match.");
                            return res.redirect('back');
                        }
                    });
                },
                function (user, done) {
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            type: 'OAuth2',
                            user: 'outsourceforgotpw@gmail.com',
                            accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x'
                        }
                    });
                    var mailOptions = {
                        to: user.email,
                        from: 'outsourceforgetpw@gmail.com',
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };
                    transporter.sendMail(mailOptions, function (err) {
                        req.flash('success', 'Success! Your password has been changed.');
                        done(err);
                    });
                }
            ], function (err) {
                res.redirect('/');
            });
        }
    },
    delete: function (req, res) {
        if(req.method === "GET"){
            User.findOne({
                id: req.params.id
            }).then((user) => {
                if (user == null) {
                    res.redirect('/')
                }
                else {
                    User.destroy({
                        where:{
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
        if(req.method === "GET"){
            res.render('auth/changePw');
        }
    }
}