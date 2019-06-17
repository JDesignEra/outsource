const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');
// Load user model
const configAuth = require('./auth');

const User = require('../models/users');


function localStrategy(passport) {
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

    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        done(null, user.id); // user.id is used to identify authenticated user
    });

    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });
    });

//     passport.use(new FacebookStrategy({
//         clientID: configAuth.facebookAuth.clientID,
//         clientSecret: configAuth.facebookAuth.clientSecret,
//         callbackURL: configAuth.facebookAuth.callbackURL
//     },
//         function (accessToken, refreshToken, profile, done) {
//             process.nextTick(function () {
//                 User.findOne({ 'facebook.id': profile.id }, function (err, user) {
//                     if (err) {
//                         return done(err);
//                     }
//                     if (user) {
//                         return done(null, user);
//                     }
//                     else {
//                         var newUser = new User();
//                         newUser.facebook.id = profile.id;
//                         newUser.facebook.token = token.accessToken;
//                         newUser.facebook.name = profile.username
//                         newUser.facebook.email = profile.enmails[0].value;

//                         newUser.save(function (err) {
//                             if (err) {
//                                 throw err;
//                             }
//                             return done(null, newUser);
//                         })
//                     }
//                 })
//             });
//         }
//     ));
 }

module.exports = { localStrategy };