const passport = require('passport');

module.exports = {
    index: function(req, res, next) {
        if (req.method === 'GET') {
            res.render('login/index');
        }
        else if (req.method === 'POST') {
            passport.authenticate('local', {
                successRedirect: '/profile',
                failureRedirect: '/login'
            })(req, res, next);
        }
    }
}
