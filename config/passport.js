const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const email = require('../helpers/email');
// Load user model
const configAuth = require('./auth');

const googleConfig = require('./googleConfig');
const User = require('../models/users');

module.exports = {
    localStrategy: (passport) => {
        passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            User.findOne({ where: { email: email } })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'No User Found' });
                    }
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
    
                        if (isMatch) {
                            return done(null, user);
                        }
                        else {
                            return done(null, false, {
                                message: 'Password incorrect'
                            });
                        }
                    })
                })
        }));
    
        //FACEBOOK API
        passport.use('facebookLogin', new FacebookStrategy({
                clientID: '900093130361854',
                clientSecret: 'ce031e037bf20d523f2c62f3ae0da1f0',
                callbackURL: 'http://localhost:5000/login/facebook/callback',
                profileFields: ['id', 'displayName', 'email']
            },
            function(accessToken, refreshToken, profile, done) {
                User.findOne({where: { facebookId: profile['id'] }}).then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {
                            message: 'You have not registered with your facebook account yet.'
                        });
                    }
                });
            }
        ));
    
        passport.use('fbRegisterClient', new FacebookStrategy({
                clientID: '900093130361854',
                clientSecret: 'ce031e037bf20d523f2c62f3ae0da1f0',
                callbackURL: 'http://localhost:5000/register/client/facebook/callback',
                profileFields: ['id', 'displayName', 'email']
            },
            function(accessToken, refreshToken, profile, done) {
                User.findOne({where: { facebookId: profile['id'] }}).then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        let password = crypto.randomBytes(4).toString('hex');
    
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(password, salt, (err, hash) => {
                                User.create({
                                    username: profile['displayName'],
                                    password: hash,
                                    email: profile['emails'][0]['value'],
                                    facebookId: profile['id'],
                                    accType: 'client'
                                }).then(user => {
                                    return done(null, user, {
                                        message: 'You may now login with facebook now.'
                                    });
                                });
                            });
                        });
                    }
                });
            }
        ));
    
        passport.use('fbRegisterService', new FacebookStrategy({
                clientID: '900093130361854',
                clientSecret: 'ce031e037bf20d523f2c62f3ae0da1f0',
                callbackURL: 'http://localhost:5000/register/service/facebook/callback',
                profileFields: ['id', 'displayName', 'email']
            },
            function(accessToken, refreshToken, profile, done) {
                User.findOne({where: { facebookId: profile['id'] }}).then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    else {
                        let password = crypto.randomBytes(4).toString('hex');
    
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(password, salt, (err, hash) => {
                                User.create({
                                    username: profile['displayName'],
                                    password: hash,
                                    email: profile['emails'][0]['value'],
                                    facebookId: profile['id'],
                                    accType: 'service'
                                }).then(user => {
                                    return done(null, user, {
                                        message: 'You may now login with facebook now.'
                                    });
                                });
                            });
                        });
                    }
                });
            }
        ));

        passport.use('google', new GoogleStrategy({
            clientID: googleConfig.keys.clientId,
            clientSecret: googleConfig.keys.clientSecret,
            callbackURL: 'http://localhost:5000/auth/google'
        },
        function(req, accessToken, refreshToken, profile, done) {
            User.findOne({
                where: {
                    [Op.or]: [{email: profile._json.email}, {googleId: profile.id}]
                }
            }).then(user => {
                if (user) {
                    if (!user['googleId']) {
                        user.update({
                            googleId: profile.id,
                            gAccessToken: refreshToken.access_token,
                            gExpire: new Date()
                        }).then(user => {
                            return done(null, user, {message: 'Google account linked sucessfully.'});
                        });
                    }
                    else {
                        user.update({
                            gAccessToken: refreshToken.access_token,
                            gExpire: new Date()
                        }).then(user => {
                            return done(null, user, {message: 'Login Sucessfully.'});
                        });
                    }
                }
                else {
                    let password = crypto.randomBytes(4).toString('hex');

                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) return done(null, false, {message: 'Google login/register error.'});

                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) return done(null, false, {message: 'Google login/register error.'});

                            User.create({
                                username: profile.displayName,
                                password: hash,
                                email: profile._json.email,
                                googleId: profile.id,
                                gAccessToken: refreshToken.access_token,
                                gExpire: new Date.now(),
                                accType: 'service',
                            }).then(user => {
                                email.send(
                                    user.email,
                                    '[Outsource] Register Successful',
                                    `<p>You are receiving this because you (or someone else) have an account.</p>` +
                                    `<p>Email: ${profile._json.email}</p>` + 
                                    `<p>Password ${password}`
                                );

                                return done(null, user, {message: 'Registered with Google account sucessfully.'});
                            }).catch(() => {
                                return done(null, false, {message: 'Google login/register error.'});
                            });
                        });
                    });
                }
            })
        }));
    
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });
    
        passport.deserializeUser((userId, done) => {
            User.findByPk(userId).then((user) => {
                done(null, user);
            }).catch((done) => {
                console.log(done);
            });
        });
     }
}