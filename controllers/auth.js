const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/users');

module.exports = {
    logout: function(req, res) {
        req.logout();
        req.flash('success', 'You have sign out successfully.');
        res.redirect('/');
    },
    login: function(req, res, next) {
        if (req.method === 'GET') {
            res.render('login/index');
        }
        else if (req.method === 'POST') {
            passport.authenticate('local', {
                successRedirect: '/profile',
                failureRedirect: '/login'
            })(req, res, next);
        }
    },
    register: function(req, res) {
        if (req.method === 'GET') {
            res.render('register/index');
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

            if (Object.getOwnPropertyNames(errors).length !== 0) {
                res.render('register/index', {
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
                            res.render('register/index', {
                                error: user.email + ' already registered.',
                                username,
                                email,
                                password,
                                cfmPassword
                            });
                        }
                        else {
                            bcrypt.genSalt(10, function(err, salt) {
                                bcrypt.hash(password, salt, function(err, hash) {
                                    password = bcrypt.hashSync(password, salt)

                                    User.create({ username, email, password, accType })
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
    }
}