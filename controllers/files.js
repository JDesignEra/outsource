const path = require('path');
const crypto = require('crypto');

const archiver = require('archiver');
const fs = require('fs-extra');
const moment = require('moment');
const mime = require('mime');
const walk = require('klaw');
const Op = require('sequelize').Op;

const bytesToSize = require('../helpers/bytesToSize');
const email = require('../helpers/email');
const filesFolders = require('../models/filesFolders');
const users = require('../models/users');

module.exports = {
    // ToDo: Share Folders and Files
    index: function (req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}`;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~addshareuser|~copy|~delshareuser|~download|~move|~newfile|~newfolder|~rename|~sharecode|~upload/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let doneCount = 0;
        let breadcrumbs = [{name: 'My Drive'}];
        let files = [];
        let tree = [];
        let shareTree = [];
        let usersAutocomplete = null;
        
        fs.ensureDirSync(root);
        
        if (!fs.exists(path.join(root, dir))) {
            req.flash('error', 'Directory does not exist.');
            res.redirect('/files');
        }

        filesFolders.findAll({ where: {uid: uid} }).then(datas => {
            if (dir !== '/') {
                breadcrumbs = ['My Drive'].concat(dir.split('/')).map((v, i, arr) => {
                    let link = '/files';

                    for (let x = 1, n = arr.length; x < n && x <= i && i < n - 1; x++) {
                        link += '/' + arr[x];
                    }
                    
                    return i < arr.length - 1 ? { name: v, link: link } : { name: v };
                 });
            }

            users.findAll({ attributes: ['id', 'username', 'email'] }).then(userDatas => {
                usersAutocomplete = userDatas ? [] : null;

                if (userDatas) {
                    for (const user of userDatas) {
                        if (user['id'] !== uid) {
                            usersAutocomplete.push(`${user['username']} (${user['email']})`);
                        }
                    }
                }
                
                walk(path.join(root)).on('data', item => {
                    let folderDir = item['path'].replace(/\\/g, '/');
                    folderDir = folderDir.slice(folderDir.indexOf(root) + root.length + 1);
    
                    let name = folderDir.slice(folderDir.lastIndexOf('/') + 1);
                    folderDir = folderDir.length !== name.length ? folderDir.slice(0, folderDir.length - name.length - 1) : '/';
                    
                    if (name) {
                        let data = datas.find(v => v.name === name && v.directory === (folderDir[0] !== '/' ? `/${folderDir}` : folderDir));
                        
                        if (data) {
                            let shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number).sort((a, b) => {return a - b}) : null;
                            let share = shareUid ? {uids: [], usernames: [], emails: []} : null;
                            
                            if (shareUid) {
                                for (const uid of shareUid) {
                                    let user = userDatas.find(v => v.id === uid);

                                    if (user) {
                                        share['uids'].push(user['id']);
                                        share['usernames'].push(user['username']);
                                        share['emails'].push(user['email']);
                                    }
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
                                    modified: modified,
                                    link: `${(folderDir !== '/' ? '/' + folderDir + '/' + name : '/' + name)}/~preview`,
                                    shareCode: data['shareCode'],
                                    share: share
                                });
                            }
                            else if (stats.isDirectory()) {
                                let link = '/files' + (folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`);
            
                                if (folderDir.toLowerCase() === dir.toLowerCase()) {
                                    files.push({
                                        id: data['id'],
                                        name: name,
                                        size: size,
                                        type: 'folder',
                                        modified: modified,
                                        link: link,
                                        shareCode: data['shareCode'],
                                        share: share
                                    });
                                }
                                
                                tree.push({
                                    id: data['id'],
                                    name: name,
                                    link: link,
                                    child: folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`,
                                    parent: folderDir !== '/' ? `/${folderDir}` : '/'
                                });
                            }
                        }
                    }
                }).on('end', () => {
                    doneCount += 1;
                });
            });
        });

        // shareTree
        filesFolders.findAll({
            where: {
                type: 'folder',
                shareUid: { [Op.like]: `%${uid}%` }
            }
        }).then(datas => {
            if (datas.length > 0) {
                for (const [i, data] of datas.entries()) {
                    let uploadRoot = `public/uploads/files/${data['uid']}`;
                    let shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number).sort((a, b) => {return a - b}) : null;
    
                    if (shareUid && shareUid.indexOf(uid) !== -1) {
                        walk(path.join(uploadRoot, data['fullPath'])).on('data', item => {
                            let stats = item.stats;

                            if (stats.isDirectory()) {
                                let folderDir = item['path'].replace(/\\/g, '/');
                                folderDir = folderDir.slice(folderDir.indexOf(uploadRoot) + uploadRoot.length + 1);
                
                                let name = folderDir.slice(folderDir.lastIndexOf('/') + 1);
                                folderDir = folderDir.length !== name.length ? folderDir.slice(0, folderDir.length - name.length - 1) : '/';
                                
                                let link = '/files' + (folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`);
                                
                                shareTree.push({
                                    id: data['id'],
                                    name: name,
                                    link: link,
                                    child: folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`,
                                    parent: folderDir !== '/' ? `/${folderDir}` : '/'
                                });
                            }
                            else if (i >= datas.length - 1) {
                                doneCount += 1;
                            }
                        }).on('end', () => {
                            if (i >= datas.length - 1) {
                                doneCount += 1;
                            }
                        });
                    }
                    else if (i >= datas.length - 1) {
                        doneCount += 1;
                    }
                }
            }
            else {
                doneCount += 1;
            }
        });

        setInterval(function() {
            if (doneCount >= 2) {
                setTimeout(() => {
                    res.render('files/index', {
                        title: 'File Management',
                        files: files,
                        folders: tree,
                        shareFolders: shareTree,
                        breadcrumbs: breadcrumbs,
                        postRoot: req.originalUrl.replace(/\/~addshareuser|\/~copy|\/~delshareuser|~download|\/~move|\/~newfile|\/~newfolder|\/~rename|\/~sharecode|\/~upload/gi, ''),
                        types: Object.keys(mime._types),
                        users: usersAutocomplete
                    });
                }, 50);

                clearInterval(this);
            }
        }, 1);
    },
    addShareUser: function(req, res) {
        let uid = req.user.id;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~addshareuser/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = parseInt(req.body.fid);

        if (fid) {
            let shareUser = req.body.shareUser;
            let errors = {};

            if (!shareUser) {
                errors['shareUser'] = 'Username or Email can\'t be empty.';
            }

            if (Object.keys(errors).length > 0) {
                req.flash('forms', {
                    shareUser: shareUser,
                    select: fid
                });

                req.flash('error', errors['shareUser']);
                res.redirect(dir === '/' ? '/files/~addshareuser' :  `/files/${dir}/~addshareuser`);
            }
            else {
                let where = {
                    where: {
                        [Op.or]: [
                            {username: shareUser},
                            {email: shareUser}
                        ]
                    }
                };

                if (shareUser.indexOf('(') !== -1 && shareUser.indexOf(')') !== -1) {
                    where = {
                        where: {
                            username: shareUser.slice(0, shareUser.indexOf(' (')),
                            email: shareUser.slice(shareUser.indexOf(' (') + 2, shareUser.lastIndexOf(')'))
                        }
                    };
                }

                users.findOne(where).then(user => {
                    if (user) {
                        filesFolders.findOne({
                            where: {
                                id: fid,
                                uid: uid
                            }
                        }).then(data => {
                            if (data) {
                                let userId = user['id'];
                                let shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number) : [];

                                if (shareUid.indexOf(userId) === -1) {
                                    shareUid.push(userId);

                                    shareUid = shareUid.sort(function(a, b) { return a - b });
                                    shareUid = shareUid.join(',');

                                    data.update({ shareUid: shareUid }).then(() => {
                                        email.sendTemplate(
                                            user['email'],
                                            '[OutSource] A file or folder has been shared with you',
                                            'addshareuser',
                                            {
                                                title: 'Shared With You',
                                                message: `${req.user.username} (${req.user.email}) has shared ${data['name']} ${data['type'] === 'folder' ? data['type'] : 'file'} with you`,
                                                host: req.hostname
                                            }
                                        );
                                        
                                        req.flash('forms', {select: fid});
                                        req.flash('success', `Sucessfully shared with ${shareUser}.`);

                                        res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                                    });
                                }
                                else {
                                    req.flash('forms', {
                                        select: fid,
                                        shareUser: shareUser
                                    });

                                    req.flash('error', `Already shared with ${shareUser}.`);
                                    res.redirect(dir === '/' ? '/files/~addshareuser' :  `/files/${dir}/~addshareuser`);
                                }
                            }
                            else {
                                req.flash('error', 'File or folder can\t be found');
                                res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                            }
                        });
                    }
                    else {
                        req.flash('forms', {
                            shareUser: shareUser,
                            select: fid
                        });
        
                        req.flash('error', `${shareUser} is not a registered user.`);
                        res.redirect(dir === '/' ? '/files/~addshareuser' :  `/files/${dir}/~addshareuser`);
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    },
    copy: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~copy/gi, '') : '/';
        dir = dir ? dir : '/';
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
                res.redirect(dir === '/' ? '/files/~copy' :  `/files/${dir}/~copy`);
            }
            else {
                filesFolders.findAll({
                    where: {
                        id: {[Op.in]: ids},
                        uid: uid
                    }
                }).then(datas => {
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
                                            id: {[Op.not]: data['id']},
                                            fullPath: {[Op.startsWith]: `${data['fullPath']}/`},
                                            uid: uid
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
    
                                loopRedirect(req, res, dir, i, datas.length, flashMsgs);
                            });
                            
                            if (name !== data['name']) {
                                flashMsgs['success'].push(`${data['name']} copied successfully as ${name}.`);
                            }
                            else {
                                flashMsgs['success'].push(`${name} copied successfully.`);
                            }
                        }).catch(() => {
                            flashMsgs['error'].push(`${name} can't be copied to a subdirectory of itself.`);

                            loopRedirect(req, res, dir, i, datas.length, flashMsgs);
                        });
                    }
                });
            }
            
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    },
    delete: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~delete/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        if (req.body.fid) {
            let ids = Array.isArray(req.body.fid) ? req.body.fid : [req.body.fid];
            
            filesFolders.findAll({
                where: {
                    id: { [Op.in]: ids },
                    uid: uid
                }
            }).then(datas => {
                let successMsgs = [];
                
                for (const [i, data] of datas.entries()) {
                    fs.remove(path.join(root, data['fullPath'])).then(() => {
                        if (data['type'] === 'folder') {
                            filesFolders.findAll({
                                where: {
                                    fullPath: {[Op.startsWith]: `${data['fullPath']}/`},
                                    uid: uid
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

                    setTimeout(() => {
                        if (i >= datas.length - 1) {
                            if (successMsgs.length > 0) req.flash('success', successMsgs);
                            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                        }
                    }, 50);
                }
            });
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    },
    delShareUser: function(req, res) {
        let uid = req.user.id;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~delshareuser/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.body.fid;
        let delUids = Array.isArray(req.body.uid) ? req.body.uid : [req.body.uid];
        
        if (fid) {
            if (delUids[0]) {
                filesFolders.findOne({ where: {id: fid, uid: uid} }).then(data => {
                    if (data) {
                        users.findAll({ 
                            where: {
                                id: { [Op.in]: delUids }
                            },
                            attributes: ['id', 'username', 'email']
                        }).then(userDatas => {
                            let emails = [];
                            let successMsgs = [];
                            let shareUid = data['shareUid'].split(',').map(Number);

                            for (const uid of delUids) {
                                let i = shareUid.indexOf(parseInt(uid));

                                if (i > -1) {
                                    let user = userDatas.find(v => v.id === shareUid[i]);
                                    successMsgs.push(`Unshared with ${user['username']} (${user['email']})`);

                                    shareUid.splice(i, 1);
                                    emails.push(user['email']);
                                }
                            }

                            shareUid = shareUid.join(',');
                            shareUid = shareUid.length > 0 ? shareUid : null;

                            data.update({ shareUid: shareUid }).then(() => {
                                if (emails.length > 0) {
                                    email.sendTemplate(
                                        emails,
                                        '[OutSource] A file or folder has been unshared with you',
                                        'addshareuser',
                                        {
                                            title: 'Unshared With You',
                                            message: `${req.user.username} (${req.user.email}) has unshared ${data['name']} ${data['type'] === 'folder' ? data['type'] : 'file'} with you`,
                                            host: req.hostname,
                                        }
                                    );
                                }

                                if (successMsgs.length > 0) {
                                    req.flash('success', successMsgs);
                                }

                                req.flash('forms', { select: data['id'] });
                                res.redirect(dir === '/' ? '/files' : `/files/${dir}`);
                            });
                        });
                    }
                    else {
                        req.flash('error', 'File or folder can\t be found.');
                        res.redirect(dir === '/' ? '/files' : `/files/${dir}`);
                    }
                });
            }
            else {
                req.flash('error', 'No user selected.');
                res.redirect(dir === '/' ? '/files/~delshareuser' : `/files/${dir}/~delshareuser`);
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' : `/files/${dir}`);
        }
    },
    download: function(req, res) {
        let uid = req.user.id;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~delshareuser/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.params.fid;
        let shareCode = req.params.code;

        if (fid || shareCode) {
            let where = { where: {id: null} };

            if (fid) {
                where = { where: {id: fid} };
            }
            else if (shareCode) {
                where = { where: {shareCode: shareCode} };
            }

            filesFolders.findOne(where).then(data => {
                if (data) {
                    let shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number) : null;
                    
                    if ((fid && data['uid'] !== uid && shareUid.indexOf(uid) === -1) && (shareCode && data['shareCode'] !== shareCode)) {
                        req.flash('error', 'You do not have permission to download this file.');
                        res.redirect(dir === '/' ? '/files' : `/files/${dir}`);
                    }
                    else {
                        let root = `public/uploads/files/${data['uid']}`;
    
                        if (data['type'] === 'folder') {
                            let code = crypto.randomBytes(5).toString('hex');
                            let directory = `public/uploads/temp/${code}`;
    
                            while(fs.existsSync(directory)) {
                                code = crypto.randomBytes(5).toString('hex');
                                directory = `public/uploads/temp/${code}`;
                            }
    
                            fs.ensureDir(directory).then(() => {
                                let zipPath = `${directory}/${data['name']}.zip`;
                                let output = fs.createWriteStream(zipPath);
                                let archive = archiver('zip', { zlib: {level: 1} });
    
                                archive.on('end', () => {
                                    setTimeout(() => {
                                        res.download(zipPath, () => {
                                            fs.remove(directory);
                                        });
                                    }, 50);
                                });
    
                                archive.pipe(output);
                                archive.directory(path.join(root, data['fullPath']), false);
                                archive.finalize();
                            });
                        }
                        else {
                            res.download(root + data['fullPath']);
                        }
                    }
                }
                else {
                    req.flash('error', 'File or folder can\'t be found');
                    res.redirect(dir === '/' ? '/files' : `/files/${dir}`);
                }
            });
        }
        else {
            req.flash('error', 'You do not have permission to download this file or this file can\'t be found.');
            res.redirect(dir === '/' ? '/files' : `/files/${dir}`);
        }
    },
    move: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~move/gi, '') : '/';
        dir = dir ? dir : '/';
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
                res.redirect(dir === '/' ? '/files/~move' :  `/files/${dir}/~move`);
            }
            else {
                filesFolders.findAll({
                    where: {
                        id: {[Op.in]: ids},
                        uid: uid
                    }
                }).then(datas => {
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
                                    
                                    res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
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
                                                        id: {[Op.not]: data['id']},
                                                        fullPath: {[Op.startsWith]: `${data['fullPath']}/`},
                                                        uid: uid
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

                                            loopRedirect(req, res, dir, i, datas.length, flashMsgs);
                                        });
                                    });
                                    
                                }).catch(() => {
                                    flashMsgs['error'].push(`${name} can't be moved to a subdirectory of itself.`);

                                    loopRedirect(req, res, dir, i, datas.length, flashMsgs);
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    },
    newfile: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir ? dir : '/';
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
            let flashErrors = Object.keys(errors).map(k => {
                return errors[k];
            });

            req.flash('forms', {
                filename: name,
                ext: ext,
                errors: errors
            });

            if (flashErrors.length > 0) {
                req.flash('error', flashErrors);
            }

            res.redirect(dir === '/' ? '/files/~newfile' :  `/files/${dir}/~newfile`);
        }
        else {
            let filename = `${name}.${ext}`;
            let fullPath = path.join(dir, filename).replace(/\\/g, '/');
            fullPath = fullPath[0] !== '/' ? `/${fullPath}` : fullPath;

            filesFolders.findOne({
                where: {
                    name: filename,
                    directory: dir[0] !== '/' ? `/${dir}` : dir,
                    fullPath: fullPath,
                    uid: uid
                }
            }).then(data => {
                let type = mime.getType(filename);
                type = type.slice(0, type.indexOf('/'));

                if (!data) {
                    filesFolders.create({
                        name: filename,
                        directory: dir[0] !== '/' ? `/${dir}` : dir,
                        fullPath: fullPath,
                        type: type,
                        uid: uid
                    }).then(data => {
                        fs.ensureFile(path.join(root, dir, filename)).then(() => {
                            req.flash('success', `${data['name']} file has been created successfully.`);
                            req.flash('forms', { select: [data['id']] });
                            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
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
                    res.redirect(dir === '/' ? '/files/~newfile' :  `/files/${dir}/~newfile`);
                }
            });
        }
    },
    newfolder: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir ? dir : '/';
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
            
            req.flash('error', errors['foldername']);
            res.redirect(dir === '/' ? '/files/~newfolder' :  `/files/${dir}/~newfolder`);
        }
        else {
            let fullPath = path.join(dir, name).replace(/\\/g, '/');
            fullPath = fullPath[0] !== '/' ? `/${fullPath}` : fullPath;

            filesFolders.findOne({
                where: {
                    name: name,
                    directory: dir[0] !== '/' ? `/${dir}`: dir,
                    fullPath: fullPath,
                    type: 'folder',
                    uid: uid
                }
            }).then(data => {
                if (!data) {
                    filesFolders.create({
                        name: name,
                        directory: dir[0] !== '/' ? `/${dir}`: dir,
                        fullPath: fullPath,
                        type: 'folder',
                        uid: uid
                    }).then(data => {
                        fs.ensureDir(path.join(root, dir, name)).then(() => {
                            req.flash('success', `${data['name']} folder has been created successfully.`);
                            req.flash('forms', { select: [data['id']] });
                            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
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
                    res.redirect(dir === '/' ? '/files/~newfolder' :  `/files/${dir}/~newfolder`);
                }
            });
        }
    },
    rename: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~rename/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.body.fid;
        let name = req.body.rename;
        let errors = {};
        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;

        if (fid) {
            if (!name) {
                errors['rename'] = 'File or folder name can\'t be empty.';
            }
            else if (regex.test(name)) {
                errors['rename'] = 'File or folder name only allow alphanumeric, underscore and dash.';
            }
    
            if (Object.keys(errors).length > 0) {
                req.flash('forms', { rename: name, select: fid, errors: errors });
                res.redirect(dir === '/' ? '/files/~rename' :  `/files${dir}/~rename`);
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
                                res.redirect(dir === '/' ? '/files/~rename' :  `/files/${dir}/~rename`);
                            }
                            else {
                                fs.rename(path.join(root, data['fullPath']), path.join(root, fullPath)).then(() => {
                                    data.update({
                                        name: name + ext,
                                        fullPath: fullPath
                                    });
    
                                    req.flash('success', `${originalName} has been renamed to ${name + ext} successfully.`);
                                    res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                                });
                            }
                        });
                    }
                    else {
                        req.flash('error', 'File can\'t be found.');
                        res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    },
    sharecode: function(req, res) {
        let uid = req.user.id;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = parseInt(req.body.fid);
        
        if (fid) {
            filesFolders.findOne({ where: {id: fid, uid: uid} }).then(data => {
                if (data) {
                    let code = null;

                    if (data['shareCode']) {
                        data.update({shareCode: code}).then(() => {
                            req.flash('success', `${data['name']} share link removed successfully.`);
                            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                        });
                    }
                    else {
                        filesFolders.findAll({ attributes: ['shareCode'] }).then(shareCodes => {
                            while (!code || shareCodes.indexOf(code) > -1) {
                                code = crypto.randomBytes(5).toString('hex');
                            }
    
                            data.update({ shareCode:  code}).then(() => {
                                req.flash('forms', { select: [fid] });
                                req.flash('success', `${data['name']} share link created successfully.`);
                                res.redirect(dir === '/' ? '/files' :  `/files/${dir}/~sharecode`);
                            });
                        });
                    }
                }
                else {
                    req.flash('error', 'File or folder can\'t be found.');
                    res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
                }
            });
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    },
    upload: function (req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;
        
        let files = req.files;
        let flashMsgs = {success: [], warning: []};
        let uploadsId = [];

        for (const [i, file] of files.entries()) {
            let fileName= file['originalname'];
            let fullPath = path.join(dir, fileName).replace(/\\/g, '/');
            let type = mime.getType(fileName) || file['mimetype'];
            type = type.slice(0, type.indexOf('/'));

            filesFolders.findOne({ where: {name: fileName, directory: dir, fullPath: fullPath, uid: uid} }).then(data => {
                fs.move(file['path'], path.join(root, dir, fileName), { overwrite: true }).then(() => {
                    if (!data) {
                        filesFolders.create({
                            name: fileName,
                            directory: dir[0] !== '/' ? `/${dir}` : dir,
                            fullPath: fullPath[0] !== '/' ? `/${fullPath}` : fullPath,
                            type: type,
                            uid: uid
                        }).then(created => {
                            uploadsId.push(created['id']);
                            flashMsgs['success'].push(`${fileName} uploaded successfully.`);

                            loopRedirect(req, res, dir, i, files.length, flashMsgs, uploadsId);
                        });
                    }
                    else {
                        uploadsId.push(data['id']);
                        flashMsgs['warning'].push(`${fileName} has been replaced.`);

                        loopRedirect(req, res, dir, i, files.length, flashMsgs, uploadsId);
                    }
                });
            });
        }
    }
}

const loopRedirect = (req, res, dir, i, lengthCheck, flashMsgs, selectIds = []) => {
    setTimeout(() => {
        if (i >= lengthCheck - 1) {
            if (flashMsgs['success'] && flashMsgs['success'].length > 0) {
                req.flash('success', flashMsgs['success']);
            }

            if (flashMsgs['warning'] && flashMsgs['warning'].length > 0) {
                req.flash('warning', flashMsgs['warning']);
            }

            if (flashMsgs['error'] && flashMsgs['error'].length > 0) {
                req.flash('error', flashMsgs['error']);
            }

            if (selectIds.length > 0) {
                req.flash('forms', { select: selectIds });
            }
            
            res.redirect(dir === '/' ? '/files' :  `/files/${dir}`);
        }
    }, 50);
}