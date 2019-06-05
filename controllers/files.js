const Users = require('../models/users');
const FilesFolders = require('../models/filesFolders');

module.exports = {
    index: function(req, res) {
        res.render('files/view', {
            title: 'File Management',
            url: req.originalUrl
        });
    }
}