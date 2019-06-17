const passport = require('passport');

module.exports = {
    index: function(req, res) {
        res.render('login/index');

        if (req.method === 'POST') {
            passport.authenticate('local', {
                successRedirect: '/profile',
                failureRedirect: '/login'
            })(req, res, next);
        }
    }
}