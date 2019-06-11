const express = require('express');
const router = express.Router();

const User = require('../models/users');

const passport = require('passport');

const bcrypt = require('bcrypt');

router.get('/profile', (req , res) => {

    res.render('user/profile')
});

router.get('/register',(req, res) => {
    res.render('user/register')
});

router.post('/register', (req, res) => {
    let errors = [];
    // Retrieves fields from register page from request body
    let { username, email, password, password2 } = req.body;

    // Checks if both passwords entered are the same
    if (password != password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    // Checks that password length is more than 4
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            username,
            email,
            password,
            password2
        });
    }
    else {
        // If all is well, checks if user is already registered
        User.findOne({ where: { email: req.body.email } })
            .then(username => {
                if (username) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user/register', {
                        error: user.email + ' already registered',
                        username,
                        email,
                        password,
                        password2
                    });
                } else {
                    // Create new user record
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(password, salt, function(err, hash) {
                            // Store hash in your password DB.
                            password = bcrypt.hashSync(password, salt)
                            User.create({ username, email, password })
                            .then(user => {
                                alertMessage(res, 'success', user.username + ' added. Please login', 'fas fa-sign-in-alt', true);
                                res.redirect('login');
                            })
                            .catch(err => console.log(err));
                        });
                        
                    });
                }
            });
    }
});

router.get('/login',(req,res) => {
    res.render('user/login')
});

module.exports = router;