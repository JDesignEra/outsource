module.exports = {
    index: function(req, res) {
        res.render('index', {
            url: req.originalUrl
        });
    }
}