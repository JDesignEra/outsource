const bcrypt = require('bcrypt');
const User = require('../models/users');

module.exports = {
    index: function(req, res) {
        res.render('register/index');

        if (req.method === 'POST') {
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
                res.render('register/index', {
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
                    .then(user => {
                        if (user) {
                            // If user is found, that means email has already been
                            // registered
                            res.render('register/index', {
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
                                        // alertMessage(res, 'success', user.username + ' added. Please login', 'fas fa-sign-in-alt', true);
                                        res.redirect('./login');
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