const fs = require('fs');
const { Op, Sequelize } = require('sequelize');

const bytesToSize = require('../helpers/bytesToSize');
const moment = require('../helpers/moment');
const filesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id !== undefined ? req.user.id : null;
        let urlPaths = req.params[0] !== '' ? '/' + req.params[0] : '/';
        
        if (uid !== null) {
            filesFolders.findAll({ where: {uid: uid}, raw: true }).then(data => {
                let root = './public/uploads/files/' + uid
                let path = root + urlPaths;

                if (!fs.existsSync(root)) {
                    fs.mkdirSync(root);
                }

                if (fs.existsSync(path)) {

                }
                else {
                    console.log('Does not exist');
                }
                
                let items = {};
                // fs.readdirSync(path).forEach(el => {
                //     let stat = fs.lstatSync(path + el);
                    
                //     items[el] = {
                //         size: bytesToSize.convert(stat.size, 0),
                //         modified: moment.format(stat.mtime, 'DD/MM/YYYY kk:mma')
                //     };
                // });

                // Object.keys(items).forEach(key => {
                //     let temp = data.find(x => x.name === key);
                //     if (temp !== undefined) {
                //         temp['sharedUid'] = temp['sharedUid'] !== null ? temp['sharedUid'].split(',') : [];
                //         temp['sharedUsername'] = temp['sharedUsername'] !== null ? temp['sharedUsername'].split(',') : [];

                //         items[key] = Object.assign({}, temp, items[key]);
                //     }
                // });

                // console.log(items);

                res.render('files/index', {
                    title: 'File Management',
                    items: Object.keys(items).length !== 0 ? items : null
                });
            });
        }
    },
    upload: function (req, res) {
        if (req.method === 'GET') {
            res.render('files/index', { title: 'File Management' });
        }
        else if (req.method === 'POST') {
            let uid = req.user.id !== undefined ? req.user.id : null;
            let files = req.files;

            if (uid !== null) {
                files.forEach(file => {
                    let fileName = file['originalname'];
                    
                    // ToDo: update where condition and path
                    filesFolders.findAll({
                        where: {
                            uid: uid,
                            name: fileName
                        }
                    }).then(data => {
                        if (data.length === 0) {
                            let path = '/';
                            
                            filesFolders.create({
                                name: fileName,
                                directory: path,
                                fullPath: path + fileName,
                                type: file['mimetype'].substring(0, file['mimetype'].indexOf('/')),
                                uid: uid
                            }).then(() => {
                                let path = './public/uploads/files/' + uid + '/';

                                if (!fs.existsSync(path)) {
                                    fs.mkdirSync(path);
                                }

                                fs.renameSync(file['path'], path + fileName, (err) => {
                                    if (err) {
                                        return console.log(err);
                                    }

                                    return;
                                });
                            });

                            res.redirect('/files');
                        }
                    });
                });
            }
        }
    }
}