const fs = require('fs');
const mime = require('mime');
const { Op, Sequelize } = require('sequelize');

const bytesToSize = require('../helpers/bytesToSize');
const moment = require('../helpers/moment');
const filesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id !== undefined ? req.user.id : undefined;
        
        if (uid !== undefined) {
            let param = req.params[0].replace(/\?newfile/gi, '').replace(/\?newfolder/gi, '').replace(/\?upload/gi, '');
            let root = './public/uploads/files/' + uid
            let path = param !== '' ? ('/' + param + '/').replace(/\/\//gi, '/') : '/';

            if (!fs.existsSync(root)) {
                fs.mkdirSync(root);
            }

            if (!fs.existsSync(root + path)) {
                return res.redirect('/files');
            }

            filesFolders.findAll({ where: {uid: uid}, raw: true }).then(data => {
                let items = {};

                fs.readdirSync(root + path).forEach(el => {
                    let stat = fs.lstatSync(root + path + el);

                    items[el] = {
                        name: el,
                        size: bytesToSize.convert(stat.size, 0),
                        modified: moment.format(stat.mtime, 'DD/MM/YYYY hh:mm a')
                    };
                });

                Object.keys(items).forEach(key => {
                    let temp = data.find(x => x.name === key);
                    
                    if (temp !== undefined) {
                        temp['sharedUid'] = temp['sharedUid'] !== null ? temp['sharedUid'].split(',') : [];
                        temp['sharedUsername'] = temp['sharedUsername'] !== null ? temp['sharedUsername'].split(',') : [];

                        items[key] = Object.assign({}, temp, items[key]);
                    }
                });

                let currentDir = path === '/' ? 'Home' : path.slice(0, -1).split('/').pop();
                let breadcrumbs = path === '/' ? ['Home'] : ['Home'].concat(path.slice(1, -1).split('/'));
                let crumbLinks = ['/files'].concat(path.slice(1, -1).split('/'));

                for(let i = 1; i < crumbLinks.length && i - 1 > -1; i++) {
                    crumbLinks[i] = crumbLinks[i - 1] + '/' + crumbLinks[i];
                }

                res.render('files/index', {
                    title: 'File Management',
                    items: Object.keys(items).length !== 0 ? items : null,
                    currentDir: currentDir,
                    breadcrumbs: breadcrumbs,
                    crumbLinks: crumbLinks
                });
            });
        }
    },
    upload: function (req, res) {
        if (req.method === 'POST') {
            let uid = req.user.id !== undefined ? req.user.id : undefined;

            if (uid !== undefined) {
                let files = req.files;
                let root = './public/uploads/files/' + uid;
                let path = req.originalUrl.replace(/^\/files/gi, '').replace(/\/%3Fupload/gi, '');
                path = path === '' ? '/' : path;

                files.forEach(file => {
                    let fileName = file['originalname'];
                    let type = mime.getType(fileName) || file['mimetype'];
                    type = type.slice(0, type.indexOf('/'));

                    filesFolders.findOne({
                        where: {
                            name: fileName,
                            directory: path,
                            fullPath: path + fileName
                        }
                    }).then(data => {
                        if (!data) {
                            filesFolders.create({
                                name: fileName,
                                directory: path,
                                fullPath: path + fileName,
                                type: type,
                                uid: uid
                            });
                        }

                        if (!fs.existsSync(root + path)) {
                            fs.mkdirSync(root + path);
                        }

                        fs.renameSync(file['path'], root + path + fileName);
                    });
                });

                res.redirect(path === '/' ? '/files' :  '/files' + path);
            }
        }
    },
    newfile: function(req, res) {
        
    },
    newfolder: function(req, res) {
        if (req.method === 'POST') {
            let uid = req.user.id !== undefined ? req.user.id : undefined;

            if (uid !== undefined) {
                let folderName = req.body.name;
                let root = './public/uploads/files/' + uid;
                let path = req.originalUrl.replace(/^\/files/gi, '').replace(/\/%3Fnewfolder/gi, '');
                path = path === '' ? '/' : path;

                let errors = {};
                let regex = /[!@#$%^&*+\-=\[\]{};':"\\|,.<>\/?]/;

                if (regex.test(folderName)) {
                    errors['name'] = 'Folder name can only contain alphanumeric, underscore and parentheses.'
                }

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    req.flash('errors', errors);
                    req.flash('forms', { name: folderName });

                    res.redirect(path === '/' ? '/files/%3Fnewfolder' :  '/files' + path + '/%3Fnewfolder');
                }
                else {
                    filesFolders.findOne({
                        where: {
                            name: folderName,
                            directory: path,
                            fullPath: path + folderName,
                            type: 'folder',
                            uid: uid
                        }
                    }).then(data => {
                        if (!data) {
                            filesFolders.create({
                                name: folderName,
                                directory: path,
                                fullPath: path + folderName,
                                type: 'folder',
                                uid: uid
                            });

                            if (!fs.existsSync(root + path + folderName)) {
                                fs.mkdirSync(root + path + folderName);
                            }
                        }
                        else {
                            req.flash('error', 'Folder already exist in current directory.');
                        }
                    }).then(() => {
                        res.redirect(path === '/' ? '/files' :  '/files' + path);
                    });
                }
            }
        }
    }
}