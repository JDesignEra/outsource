const { Op, Sequelize } = require('sequelize');

const { move } = require('../helpers/fileSystem');
const Users = require('../models/users');
const FilesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        res.render('files/index', {
            title: 'File Management',
            url: req.originalUrl
        });
    },
    upload: function (req, res) {
        let files = req.files;
        
        FilesFolders.findAll({
            limit: 1,
            order: [['id', 'ASC']],
            attributes: ['id'],
            plain: true,
            raw: true
        }).then(function (data) {
            let id = (data.length > 0 ? data.id : 1);

            files.forEach(file => {
                let extension = file['originalname'].substring(file['originalname'].indexOf('.'));
                let path = './public/uploads/files/';
                console.log(id);
                
                // ToDo: set uid
                move(file['path'], path + '1/' + id + extension);
                
                FilesFolders.create({
                    name: file['originalname'],
                    directory: path,
                    type: file['mimetype'].substring(0, file['mimetype'].indexOf('/')),
                    uid: 1
                });
            });
        });
    }
}