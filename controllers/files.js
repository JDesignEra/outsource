// const fs = require('fs');
const path = require('path');
const mime = require('mime');
const fs = require('fs-extra');
const walk = require('klaw');
const moment = require('moment');

const bytesToSize = require('../helpers/bytesToSize');
const filesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile|~newfolder|~upload/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir;
        
        fs.ensureDir(root);

        if (!fs.existsSync(path.join(root, dir))) {
            req.flash('error', 'Directory does not exist.');
            res.redirect('/files');
        }

        filesFolders.findAll({ where: {uid: uid}, raw: true }).then(datas => {
            let breadcrumbs = [{name: 'root'}];
            
            if (dir !== '/') {
                breadcrumbs = ['root'].concat(dir.split('/')).map((v, i, arr) => {
                    let link = '/files';

                    for (let x = 1, n = arr.length; x < n && x <= i && i < n - 1; x++) {
                        link += '/' + arr[x];
                    }
                    
                    return i < arr.length - 1 ? { name: v, link: link } : { name: v };
                 });
            }

            let files = [];
            let tree = [];

            walk(path.join(root)).on('data', item => {
                let folderDir = item['path'].replace(/\\/g, '/');
                    folderDir = folderDir.slice(folderDir.indexOf(root) + root.length + 1);

                let stats = item['stats'];
                let size = bytesToSize.convert(stats.size);
                    size = size === '0 Bytes' ? '--' : size;

                let name = folderDir.slice(folderDir.lastIndexOf('/') + 1);
                    folderDir = folderDir.length !== name.length ? folderDir.slice(0, folderDir.length - name.length - 1) : '/';

                let data = datas.find(v => v.name === name && v.directory === folderDir);
                
                if (name !== '' && stats.isFile() && folderDir.toLowerCase() === dir.toLowerCase()) {
                    let type = mime.getType(name);

                    files.push({
                        id: data.id,
                        name: name,
                        size: size,
                        type: type.slice(0, type.indexOf('/')),
                        modified: moment(stats.mtime).format('DD/MM/YYYY hh:mm a'),
                        link: '/preview' + (folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name)
                    });
                }
                else if (name !== '' && stats.isDirectory()) {
                    let link = '/files' + (folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name);

                    if (folderDir.toLowerCase() === dir.toLowerCase()) {
                        files.push({
                            id: data.id,
                            name: name,
                            size: size,
                            type: 'folders',
                            modified: moment(stats.mtime).format('DD/MM/YYYY hh:mm a'),
                            link: link
                        });
                    }
                    
                    tree.push({
                        name: name,
                        link: link,
                        child: folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name,
                        parent: folderDir !== '/' ? '/' + folderDir : '/'
                    });
                }
            }).on('end', () => {
                res.render('files/index', {
                    title: 'File Management',
                    files: files,
                    folders: tree,
                    breadcrumbs: breadcrumbs,
                    postRoot: req.originalUrl.replace(/\/~newfile|\/~newfolder|\/~upload/gi, '')
                });
            });
        });
    },
    upload: function (req, res) {
        let uid = req.user.id;
        let files = req.files;
        let root = './public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir;

        files.forEach(file => {
            let fileName = file['originalname'];
            let type = mime.getType(fileName) || file['mimetype'];
            type = type.slice(0, type.indexOf('/'));

            filesFolders.findOne({
                where: {
                    name: fileName,
                    directory: dir,
                    fullPath: path.join(dir, fileName).replace(/\\/g, '/')
                }
            }).then(data => {
                if (!data) {
                    filesFolders.create({
                        name: fileName,
                        directory: dir,
                        fullPath: path.join(dir, fileName).replace(/\\/g, '/'),
                        type: type,
                        uid: uid
                    });
                }
                else {
                    req.flash('warning', fileName + ' has been replaced.')
                }

                if (!fs.existsSync(path.join(root, dir))) {
                    fs.mkdirSync(path.join(root, dir));
                }

                fs.renameSync(file['path'], path.join(root, dir, fileName));
            });
        });

        res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
    },
    copy: function(req, res) {
        // ToDo: Copy
    },
    delete: function(req, res) {
        // ToDo: Delete
    },
    move: function(req, res) {
        // ToDo: Move
    },
    newfile: function(req, res) {
        // ToDo: new file
    },
    newfolder: function(req, res) {
        let uid = req.user.id;
        let folderName = req.body.name;
        let root = './public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir;
        
        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;

        if (regex.test(folderName)) {
            req.flash('forms', {
                'name': folderName,
                'errors': {
                    'name': 'Folder name only allow alphanumeric, underscore and dash.'
                }
            });
            
            res.redirect(dir === '/' ? '/files/~newfolder' :  '/files' + dir + '/~newfolder');
        }
        else {
            filesFolders.findOne({
                where: {
                    name: folderName,
                    directory: dir,
                    fullPath: path.join(dir, folderName).replace(/\\/g, '/'),
                    type: 'folder',
                    uid: uid
                }
            }).then(data => {
                if (!data) {
                    filesFolders.create({
                        name: folderName,
                        directory: dir,
                        fullPath: path.join(dir, folderName).replace(/\\/g, '/'),
                        type: 'folder',
                        uid: uid
                    });

                    if (!fs.existsSync(path.join(root, dir, folderName))) {
                        fs.mkdirSync(path.join(root, dir, folderName));
                    }
                }
                else {
                    req.flash('error', 'Folder already exist in current directory.');
                }
            }).then(() => {
                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
            });
        }
    },
    rename: function(req, res) {
        // ToDo: Rename
    }
}