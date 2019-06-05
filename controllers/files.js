const Users = require('../models/users.js');

module.exports = {
    index: function(req, res) {
        res.render('files/view', {
            title: 'File Management',
            url: req.originalUrl
        });
    }
}