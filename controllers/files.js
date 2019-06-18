const { Op, Sequelize } = require('sequelize');
const fs = require('fs');
const FilesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        res.render('files/index', {
            title: 'File Management',
            url: req.originalUrl
        });
    },
    upload: function (req, res) {
        if (req.method === 'POST') {
            let files = req.files;
        
            FilesFolders.findAll({
                limit: 1,
                order: [['id', 'ASC']],
                attributes: ['id'],
                plain: true,
                raw: true
            }).then(function (data) {
                files.forEach(file => {
                    console.log(file);
                    let path = './public/uploads/files/1/'    // ToDo: set uid

                    if (!fs.existsSync(path)) {
                        fs.mkdirSync(path);
                    }
                    
                    fs.renameSync(file['path'], path + file['originalname'], (err) => {
                        if (!err) {
                            FilesFolders.create({
                                name: file['originalname'],
                                directory: path,
                                type: file['mimetype'].substring(0, file['mimetype'].indexof('/')),
                                uid: 1
                            });
                        }
                    });
                });
            });
        }
    }
}