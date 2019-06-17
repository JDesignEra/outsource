const passport = require('passport');

module.exports = {
    index: function(req, res) {
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