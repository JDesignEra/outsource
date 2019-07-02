// const fs = require('fs');
const path = require('path');
const mime = require('mime');
const fs = require('fs-extra');
const walk = require('klaw');
const moment = require('moment');
const Op = require('sequelize').Op;

const bytesToSize = require('../helpers/bytesToSize');
const filesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile|~newfolder|~rename|~upload/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir ? dir : '/';
        
        fs.ensureDir(root);
        
        if (!fs.exists(path.join(root, dir))) {
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

                let data = datas.find(v => v.name === name && v.directory === (folderDir[0] !== '/' ? '/' + folderDir : folderDir));
                
                if (name && data && stats.isFile() && folderDir.toLowerCase() === dir.toLowerCase()) {
                    let type = mime.getType(name);

                    files.push({
                        id: data['id'],
                        name: name,
                        size: size,
                        type: type.slice(0, type.indexOf('/')),
                        modified: moment(stats.mtime).format('DD/MM/YYYY hh:mm a'),
                        link: '/preview' + (folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name)
                    });
                }
                else if (name && data && stats.isDirectory()) {
                    let link = '/files' + (folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name);

                    if (folderDir.toLowerCase() === dir.toLowerCase()) {
                        files.push({
                            id: data['id'],
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
                    postRoot: req.originalUrl.replace(/\/~newfile|\/~newfolder|\/~rename|\/~upload/gi, '')
                });
            });
        });
    },
    copy: function(req, res) {
        // ToDo: Copy
    },
    delete: function(req, res) {
        if (req.body.fid) {
            let uid = req.user.id;
            let root = 'public/uploads/files/' + uid + '/';
            let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~delete/gi, '') : '/';
            dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir ? dir : '/';

            let id = Array.isArray(req.body.fid) ? req.body.fid : [req.body.fid];
            let removeDir = [];
            
            filesFolders.findAll({ where: {id: { [Op.in]: id }}, raw: true }).then(datas => {
                let folders = datas.filter(v => v.type === 'folder');

                for (data of datas) {
                    removeDir.push(data['fullPath']);
                }

                filesFolders.destroy({ where: {id: { [Op.in ]: id }} });
                
                // Find child folders and files in database and removed too.
                for (folder of folders) {
                    filesFolders.findAll({
                        where: { directory: { [Op.like]: folder['fullPath'] } },
                        raw: true
                    }).then(datas => {
                        let childId = [];
                        
                        for (data of datas) {
                            if (folder['fullPath'] === data.directory.slice(0, folder['fullPath'].length)) {
                                childId.push(data['id']);
                            }
                        }

                        filesFolders.destroy({ where: {id: { [Op.in]: childId }} });
                    });
                }

                // Remove all selected directories
                for (let i = 0, n = removeDir.length; i < n; i++) {
                    fs.remove(path.join(root, removeDir[i]));
                }

                req.flash('success', 'Selected content(s) has been deleted.');
                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
            });
        }
        else {
            req.flash('error', 'Please select a file or folder to delete.');
        }
    },
    move: function(req, res) {
        // ToDo: Move
    },
    newfile: function(req, res) {
        // ToDo: new file
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir ? dir : '/';


    },
    newfolder: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir ? dir : '/';

        let name = req.body.name;
        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;
        let errors = {};

        if (!name) {
            errors['folderName'] = 'Folder name can\'t be empty.';
        }
        else if (regex.test(name)) {
            errors['folderName'] = 'Folder name can only contain aplhanumeric, underscore and dash.';
        }

        if (Object.keys(errors).length > 0) {
            req.flash('forms', {
                'name': name,
                'errors': errors
            });
            
            res.redirect(dir === '/' ? '/files/~newfolder' :  '/files' + dir + '/~newfolder');
        }
        else {
            filesFolders.findOne({
                where: {
                    name: name,
                    directory: dir,
                    fullPath: path.join(dir, name).replace(/\\/g, '/'),
                    type: 'folder',
                    uid: uid
                }
            }).then(data => {
                if (!data) {
                    filesFolders.create({
                        name: name,
                        directory: dir,
                        fullPath: path.join(dir, name).replace(/\\/g, '/'),
                        type: 'folder',
                        uid: uid
                    }).then(data => {
                        fs.ensureDir(path.join(root, dir, name));
                        
                        req.flash('success', `${data['dataValues']['name']} folder has been created successfully.`);
                        req.flash('forms', { select: [data['dataValues']['id']] });
                        res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                    });
                }
                else {
                    req.flash('error', `${name} folder already exist in the current directory.`);
                    res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                }
            });
        }
    },
    rename: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~rename/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir ? dir : '/';

        let fid = req.body.fid;
        let name = req.body.name;

        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;

        if (regex.test(name)) {
            req.flash('forms', {
                select: fid,
                errors: {
                    rename: 'Files and folder name only allow alphanumeric, underscore and dash.'
                }
            });
            
            res.redirect(dir === '/' ? '/files/~rename' :  '/files' + dir + '/~rename');
        }
        else {
            filesFolders.findOne({
                where: {
                    id: fid,
                    uid: uid
                }
            }).then(data => {
                if (data) {
                    let fullPath = data['fullPath'].slice(0, data['fullPath'].lastIndexOf('/'));
                    let ext = data['type'] !== 'folder' ? data['name'].slice(data['name'].lastIndexOf('.')) : '';
    
                    fullPath = fullPath + '/' + name + ext;
    
                    fs.rename(path.join(root, data['fullPath']), path.join(root, fullPath)).then(() => {
                        data.update({
                            name: name + ext,
                            fullPath: fullPath
                        });
                        
                        req.flash('forms', { select: [data['id']] });
                        res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                    });
                    
                }
                else {
                    req.flash('error', 'File can\'t be found.');
                    res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                }
            });
        }
    },
    upload: function (req, res) {
        let uid = req.user.id;
        let files = req.files;
        let root = 'public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir[dir.length - 1] === '/' && dir.length > 1 ? dir.slice(0, -1) : dir ? dir : '/';

        let names = [];
        let paths = [];
        let uploadsId = [];
        let replaceMsg = [];

        files.forEach((file, i) => {
            let fileName = file['originalname'];
            let fullPath = path.join(dir, fileName).replace(/\\/g, '/');
            let type = mime.getType(fileName) || file['mimetype'];
                type = type.slice(0, type.indexOf('/'));

            names.push(fileName);
            paths.push(fullPath);

            filesFolders.findOne({
                where: {
                    name: fileName,
                    directory: dir,
                    fullPath: fullPath
                }
            }).then(data => {
                if (!data) {
                    filesFolders.create({
                        name: fileName,
                        directory: dir,
                        fullPath: fullPath,
                        type: type,
                        uid: uid
                    }).then(data => {
                        filesFolders.findAll({
                            where: {
                                name: { [Op.in]: names },
                                fullPath: { [Op.in]: paths },
                                directory: dir
                            }
                        }).then(datas => {
                            if (i >= files.length - 1) {
                                datas.forEach(data => {
                                    uploadsId.push(data['id']);
                                });

                                if (replaceMsg.length > 0) {
                                    req.flash('warning', replaceMsg);
                                }
                                
                                req.flash('success', 'Files has been uploaded successfully.');
                                req.flash('forms', {select: uploadsId});
                                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                            }
                        });
                    });
                }
                else {
                    replaceMsg.push(data['name'] + ' has been replaced.')

                    if (i >= files.length - 1) {
                        filesFolders.findAll({
                            where: {
                                name: { [Op.in]: names },
                                fullPath: { [Op.in]: paths },
                                directory: dir
                            }
                        }).then(datas => {
                            datas.forEach(data => {
                                uploadsId.push(data['id']);
                            });

                            req.flash('success', 'Files has been uploaded successfully.');
                            req.flash('warning', replaceMsg);
                            req.flash('forms', {select: uploadsId});
                            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                        });
                    }
                }
            });

            fs.move(file['path'], path.join(root, dir, fileName), { overwrite: true });
        });
    }
}