module.exports = {
  isAuth: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    
    req.flash('error', 'Please sign in to view the page.');
    res.redirect('/login');
  },
  forwardAuth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect('/profile');
  }
};