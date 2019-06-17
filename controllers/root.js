module.exports = {
    index: function(req, res) {
        res.render('index', {
            url: req.originalUrl,
            toast: {
                info: req.flash('info'),
                warning: req.flash('warning'),
                success: req.flash('success'),
                error : req.flash('error')
            }
        });
    }
}