const path = require('path');
const mime = require('mime');
const fs = require('fs-extra');
const walk = require('klaw');
const moment = require('moment');
const Op = require('sequelize').Op;

const bytesToSize = require('../helpers/bytesToSize');
const filesFolders = require('../models/filesFolders');
const users = require('../models/users');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~copy|~move|~newfile|~newfolder|~rename|~upload/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;
        
        fs.ensureDirSync(root);
        
        if (!fs.exists(path.join(root, dir))) {
            req.flash('error', 'Directory does not exist.');
            res.redirect('/files');
        }

        filesFolders.findAll({ where: {uid: uid} }).then(datas => {
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

                let name = folderDir.slice(folderDir.lastIndexOf('/') + 1);
                folderDir = folderDir.length !== name.length ? folderDir.slice(0, folderDir.length - name.length - 1) : '/';

                if (name) {
                    let data = datas.find(v => v.name === name && v.directory === (folderDir[0] !== '/' ? '/' + folderDir : folderDir));

                    if (data) {
                        let sharedUid = data['sharedUid'] ? data['sharedUid'].split(',').sort(function(a, b) {return a - b}) : [null];
                        
                        users.findAll({
                            where: {
                                id: { [Op.in]: sharedUid }
                            },
                            attributes: ['username']
                        }).then(username => {
                            let sharedUsername = [];

                            if (username.length > 0) {
                                for (const user of userDatas) {
                                    sharedUsername.push(user['username']);
                                }
                            }

                            let stats = item['stats'];

                            let modified = moment.duration(moment(new Date).diff(stats['mtime']));
                            modified = modified / (1000 * 60 * 60 * 24) < 1 ? `${modified.humanize()} ago` : moment(stats.mtime).format('DD/MM/YYYY hh:mm a');
                            
                            let size = bytesToSize.convert(stats['size']);
                            size = size === '0 Bytes' ? '--' : size;

                            if (stats.isFile() && folderDir.toLowerCase() === dir.toLowerCase()) {
                                let type = mime.getType(name);
                                type = type ? type.slice(0, type.indexOf('/')) : data['type'];
            
                                files.push({
                                    id: data['id'],
                                    name: name,
                                    size: size,
                                    type: type,
                                    sharedUid: sharedUid[0] ? null : sharedUid,
                                    sharedUsername: sharedUsername.length > 0 ? sharedUsername : null,
                                    modified: modified,
                                    link: `${(folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name)}/~preview`
                                });
                            }
                            else if (stats.isDirectory()) {
                                let link = '/files' + (folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name);
            
                                if (folderDir.toLowerCase() === dir.toLowerCase()) {
                                    files.push({
                                        id: data['id'],
                                        name: name,
                                        size: size,
                                        type: 'folder',
                                        sharedUid: sharedUid[0] ? null : sharedUid,
                                        sharedUsername: sharedUsername.length > 0 ? sharedUsername : null,
                                        modified: modified,
                                        link: link
                                    });
                                }
                                
                                tree.push({
                                    id: data['id'],
                                    name: name,
                                    link: link,
                                    child: folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name,
                                    parent: folderDir !== '/' ? '/' + folderDir : '/'
                                });
                            }
                        });
                    }
                }
            }).on('end', () => {
                setTimeout(() => {
                    res.render('files/index', {
                        title: 'File Management',
                        files: files,
                        folders: tree,
                        breadcrumbs: breadcrumbs,
                        postRoot: req.originalUrl.replace(/\/~copy|\/~move|\/~newfile|\/~newfolder|\/~rename|\/~upload/gi, ''),
                        types: Object.keys(mime._types)
                    });
                }, 100);
            });
        });
    },
    copy: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~copy/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let ids = req.body.fid.split(',');

        if (ids.length > 0) {
            let copyDir = req.body.directory ? req.body.directory : '/';
            let errors = {};
            let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>?]/;

            if (regex.test(copyDir)) {
                errors['copyDir'] = 'Directory path only allow alphanumeric, underscore, dash and forward slash.';
            }
            else if (!fs.pathExistsSync(path.join(root, copyDir))) {
                errors['copyDir'] = 'Directory path does not exist.';
            }

            if (Object.keys(errors).length > 0) {
                req.flash('forms', {
                    copyDir: copyDir,
                    errors: { copyDir: errors['copyDir']},
                    select: ids
                });

                req.flash('error', errors['copyDir']);
                res.redirect(dir === '/' ? '/files/~copy' :  '/files' + dir + '/~copy');
            }
            else {
                filesFolders.findAll({ where: {id: {[Op.in]: ids}} }).then(datas => {
                    let flashMsgs = {success: [], error: []};
                    let directory = copyDir.length > 1 && copyDir[0] !== '/' ? `/${copyDir}` : copyDir;
                    directory = directory.length > 1 && directory[directory.length - 1] === '/' ? directory.slice(0, directory.length - 1) : directory;

                    for (const [i, data] of datas.entries()) {
                        let name = data['name'];

                        while(fs.pathExistsSync(path.join(root, directory, name))) {
                            name = name.lastIndexOf('.') === -1 ? `${name} - Copy` : `${name.slice(0, name.lastIndexOf('.'))} - Copy${name.slice(name.lastIndexOf('.'))}`;
                        }

                        let fullPath = directory === '/' ? `${directory}${name}` : `${directory}/${name}`;

                        fs.copy(path.join(root, data['fullPath']), path.join(root, directory, name)).then(() => {
                            filesFolders.create({
                                name: name,
                                directory: directory,
                                fullPath: fullPath,
                                type: data['type'],
                                uid: uid
                            }).then(() => {
                                if (data['type'] === 'folder') {
                                    filesFolders.findAll({
                                        where :{
                                            fullPath: {[Op.startsWith]: `${data['fullPath']}/`},
                                            id: {[Op.not]: data['id']}
                                        }
                                    }).then(childs => {
                                        for (const child of childs) {
                                            filesFolders.create({
                                                name: child['name'],
                                                directory: fullPath,
                                                fullPath: `${fullPath}/${child['name']}`,
                                                type: child['type'],
                                                uid: uid
                                            });
                                        }
                                    });
                                }
    
                                if (i >= datas.length - 1) {
                                    if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                                    if (flashMsgs['error'].length > 0) req.flash('error', flashMsgs['error']);
                                    
                                    res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                                }
                            });
                            
                            if (name !== data['name']) {
                                flashMsgs['success'].push(`${data['name']} copied successfully as ${name}.`);
                            }
                            else {
                                flashMsgs['success'].push(`${name} copied successfully.`);
                            }
                        }).catch(() => {
                            flashMsgs['error'].push(`${name} can't be copied to a subdirectory of itself.`);

                            if (i >= datas.length - 1) {
                                if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                                if (flashMsgs['error'].length > 0) req.flash('error', flashMsgs['error']);
                                
                                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                            }
                        });
                    }
                });
            }
            
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
        }
    },
    delete: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~delete/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        if (req.body.fid) {
            let ids = Array.isArray(req.body.fid) ? req.body.fid : [req.body.fid];
            
            filesFolders.findAll({ where: {id: { [Op.in]: ids }} }).then(datas => {
                let successMsgs = [];
                
                for (const [i, data] of datas.entries()) {
                    fs.remove(path.join(root, data['fullPath'])).then(() => {
                        if (data['type'] === 'folder') {
                            filesFolders.findAll({
                                where: {
                                    fullPath: {[Op.startsWith]: `${data['fullPath']}/`}
                                }
                            }).then(childs => {
                                for (const child of childs) {
                                    child.destroy();
                                }
                            });
                        }

                        data.destroy();
                        successMsgs.push(`${data['name']} deleted sucessfully`);
                    });

                    if (i >= datas.length - 1) {
                        if (successMsgs.length > 0) req.flash('success', successMsgs);
                        res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                    }
                }
            });
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
        }
    },
    move: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~move/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let ids = req.body.fid.split(',');

        if (ids.length > 0) {
            let moveDir = req.body.directory ? req.body.directory : '/';
            let errors = {};
            let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>?]/;

            if (regex.test(moveDir)) {
                errors['moveDir'] = 'Directory path only allow alphanumeric, underscore, dash and forward slash.';
            }
            else if (!fs.pathExistsSync(path.join(root, moveDir))) {
                errors['moveDir'] = 'Directory path does not exist.';
            }

            if (Object.keys(errors).length > 0) {
                req.flash('forms', {
                    moveDir: moveDir,
                    errors: { moveDir: errors['copyDir']},
                    select: ids
                });

                req.flash('error', errors['moveDir']);
                res.redirect(dir === '/' ? '/files/~move' :  '/files' + dir + '/~move');
            }
            else {
                filesFolders.findAll({ where: {id: {[Op.in]: ids}} }).then(datas => {
                    let flashMsgs = {success: [], error: []};
                    let directory = moveDir.length > 1 && moveDir[0] !== '/' ? `/${moveDir}` : moveDir;
                    directory = directory.length > 1 && directory[directory.length - 1] === '/' ? directory.slice(0, directory.length - 1) : directory;

                    for (const [i, data] of datas.entries()) {
                        let name = data['name'];
                        let fullPath = directory === '/' ? `${directory}${name}` : `${directory}/${name}`;
                        
                        fs.pathExists(path.join(root, directory, name)).then(exist => {
                            if (exist) {
                                flashMsgs['error'].push(`${name} not moved as a file or folder with the same name exist in that directory.`);

                                if (i >= datas.length - 1) {
                                    if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                                    if (flashMsgs['error'].length > 0) req.flash('error', flashMsgs['error']);
                                    
                                    res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                                }
                            }
                            else {
                                fs.copy(path.join(root, data['fullPath']), path.join(root, directory, name)).then(() => {
                                    flashMsgs['success'].push(`${name} moved successfully.`);

                                    fs.remove(path.join(root, data['fullPath'])).then(() => {
                                        data.update({
                                            directory: directory,
                                            fullPath: fullPath
                                        }).then(() => {
                                            if (data['type'] === 'folder') {
                                                filesFolders.findAll({
                                                    where: {
                                                        fullPath: {[Op.startsWith]: `${data['fullPath']}/`},
                                                        id: {[Op.not]: data['id']}
                                                    }
                                                }).then(childs => {
                                                    for (const child of childs) {
                                                        child.update({
                                                            directory: fullPath,
                                                            fullPath: `${fullPath}/${child['name']}`
                                                        });
                                                    }
                                                });
                                            }

                                            if (i >= datas.length - 1) {
                                                if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                                                if (flashMsgs['error'].length > 0) req.flash('error', flashMsgs['error']);
                                                
                                                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                                            }
                                        });
                                    });
                                    
                                }).catch(() => {
                                    flashMsgs['error'].push(`${name} can't be moved to a subdirectory of itself.`);
    
                                    if (i >= datas.length - 1) {
                                        if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                                        if (flashMsgs['error'].length > 0) req.flash('error', flashMsgs['error']);
                                        
                                        res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
        }
    },
    newfile: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let name = req.body.name;
        let ext = req.body.ext;
        let errors = {};
        let nameRegex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;
        let extRegex = /[^a-zA-Z0-9-]/;
        
        if (!name) {
            errors['filename'] = 'File name can\'t be empty.';
        }
        else if (nameRegex.test(name)) {
            errors['filename'] = 'File name only allow alphanumeric, underscore and dash.';
        }
        
        if (!ext) {
            errors['ext'] = 'Extension can\'t be empty.';
        }
        else if (extRegex.test(ext)) {
            errors['ext'] = 'Extension only allow alphanumeric and dash.';
        }

        if (Object.keys(errors).length > 0) {
            req.flash('forms', {
                filename: name,
                ext: ext,
                errors: errors
            });

            res.redirect(dir === '/' ? '/files/~newfile' :  '/files' + dir + '/~newfile');
        }
        else {
            let filename = `${name}.${ext}`;

            filesFolders.findOne({
                where: {
                    name: filename,
                    directory: dir,
                    fullPath: path.join(dir, filename).replace(/\\/g, '/'),
                    uid: uid
                }
            }).then(data => {
                let type = mime.getType(filename);
                type = type.slice(0, type.indexOf('/'));

                if (!data) {
                    filesFolders.create({
                        name: filename,
                        directory: dir,
                        fullPath: path.join(dir, filename).replace(/\\/g, '/'),
                        type: type,
                        uid: uid
                    }).then(data => {
                        fs.ensureFile(path.join(root, dir, filename)).then(() => {
                            req.flash('success', `${data['name']} file has been created successfully.`);
                            req.flash('forms', { select: [data['id']] });
                            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                        });
                    });
                }
                else {
                    let errorMsg = `${filename} file already exist in the current directory.`;
                    
                    req.flash('forms', {
                        filename: name,
                        ext: ext,
                        errors: {
                            filename: errorMsg
                        }
                    });
                    
                    req.flash('error', errorMsg);
                    res.redirect(dir === '/' ? '/files/~newfile' :  '/files' + dir + '/~newfile');
                }
            });
        }
    },
    newfolder: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let name = req.body.name;
        let errors = {};
        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;

        if (!name) {
            errors['foldername'] = 'Folder name can\'t be empty.';
        }
        else if (regex.test(name)) {
            errors['foldername'] = 'Folder name can only contain alphanumeric, underscore and dash.';
        }

        if (Object.keys(errors).length > 0) {
            req.flash('forms', {
                foldername: name,
                errors: errors
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
                        fs.ensureDir(path.join(root, dir, name)).then(() => {
                            req.flash('success', `${data['name']} folder has been created successfully.`);
                            req.flash('forms', { select: [data['id']] });
                            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                        });
                    });
                }
                else {
                    let errorMsg = `${name} folder already exist in the current directory.`;

                    req.flash('forms', {
                        foldername: name,
                        errors: {
                            foldername: errorMsg
                        }
                    });

                    req.flash('error', errorMsg);
                    res.redirect(dir === '/' ? '/files/~newfolder' :  '/files' + dir + '/~newfolder');
                }
            });
        }
    },
    rename: function(req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~rename/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.body.fid;
        let name = req.body.rename;
        let errors = {};
        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;

        if (!fid) {
            errors['rename'] = 'No file or folder selected.'
        }
        else if (!name) {
            errors['rename'] = 'File or folder name can\'t be empty.';
        }
        else if (regex.test(name)) {
            errors['rename'] = 'File or folder name only allow alphanumeric, underscore and dash.';
        }

        if (Object.keys(errors).length > 0) {
            req.flash('forms', { rename: name, select: fid, errors: errors });
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
                    let originalName = data['name'];
                    let fullPath = data['fullPath'].slice(0, data['fullPath'].lastIndexOf('/'));
                    let ext = data['type'] !== 'folder' ? data['name'].slice(data['name'].lastIndexOf('.')) : '';
                    
                    fullPath = `${fullPath}/${name + ext}`;

                    filesFolders.findOne({
                        where: {
                            name: name + ext,
                            fullPath: fullPath
                        }
                    }).then(exist => {
                        if (exist) {
                            req.flash('forms', {
                                rename: name,
                                select: fid,
                                errors: {
                                    rename: `${name + ext} already exist in the current directory.`
                                }
                            });

                            req.flash('error', `${name + ext} already exist in the current directory.`);
                            res.redirect(dir === '/' ? '/files/~rename' :  '/files' + dir + '/~rename');
                        }
                        else {
                            fs.rename(path.join(root, data['fullPath']), path.join(root, fullPath)).then(() => {
                                data.update({
                                    name: name + ext,
                                    fullPath: fullPath
                                });

                                req.flash('success', `${originalName} has been renamed to ${name + ext} successfully.`);
                                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                            });
                        }
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
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let flashMsgs = {success: [], warning: []};
        let uploadsId = [];

        for (const [i, file] of files.entries()) {
            let fileName= file['originalname'];
            let fullPath = path.join(dir, fileName).replace(/\\/g, '/');
            let type = mime.getType(fileName) || file['mimetype'];
            type = type.slice(0, type.indexOf('/'));

            filesFolders.findOne({ where: {name: fileName, directory: dir, fullPath: fullPath} }).then(data => {
                fs.move(file['path'], path.join(root, dir, fileName), { overwrite: true }).then(() => {
                    if (!data) {
                        filesFolders.create({
                            name: fileName,
                            directory: dir,
                            fullPath: fullPath,
                            type: type,
                            uid: uid
                        }).then(created => {
                            uploadsId.push(created['id']);
                            flashMsgs['success'].push(`${fileName} uploaded successfully.`);

                            if (i >= files.length - 1) {
                                if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                                if (flashMsgs['warning'].length > 0) req.flash('warning', flashMsgs['warning']);

                                req.flash('forms', { select: uploadsId });
                                res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                            }
                        });
                    }
                    else {
                        uploadsId.push(data['id']);
                        flashMsgs['warning'].push(`${fileName} has been replaced.`);

                        if (i >= files.length - 1) {
                            if (flashMsgs['success'].length > 0) req.flash('success', flashMsgs['success']);
                            if (flashMsgs['warning'].length > 0) req.flash('warning', flashMsgs['warning']);
                            
                            req.flash('forms', { select: uploadsId });
                            res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
                        }
                    }
                });
            });
        }
    }
}