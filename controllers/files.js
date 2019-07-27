const path = require('path');
const crypto = require('crypto');

const archiver = require('archiver');
const fs = require('fs-extra');
const moment = require('moment');
const mime = require('mime');
const walk = require('klaw');
const Op = require('sequelize').Op;
const literal = require('sequelize').literal;

const bytesToSize = require('../helpers/bytesToSize');
const email = require('../helpers/email');
const filesFolders = require('../models/filesFolders');
const filesFoldersComments = require('../models/filesFoldersComments');
const users = require('../models/users');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~addshareuser|~copy|~delshareuser|~download|~move|~newfile|~newfolder|~rename|~sharecode|~upload/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;
        
        let doneCount = 0;
        let breadcrumbs = [{name: (rootUrl === '/files/my-drive' || rootUrl === '/files' ? 'My Drive' : 'Share Drive')}];
        let files = [];
        let tree = [];
        let shareTree = [];
        let usersAutocomplete = null;
        
        fs.ensureDirSync(root);
        
        if (!fs.existsSync(path.join(root, dir))) {
            req.flash('error', 'Directory does not exist.');
            res.redirect(rootUrl);
        }
        else {
            filesFolders.findAll({ where: {uid: uid} }).then(datas => {
                if (dir !== '/') {
                    breadcrumbs = [(rootUrl === '/files/my-drive' || rootUrl === '/files' ? 'My Drive' : 'Share Drive')].concat(dir.split('/')).map((v, i, arr) => {
                        let link = rootUrl;
    
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
                                
                                if ((rootUrl === '/files/my-drive' || rootUrl === '/files') && stats.isFile() && folderDir.toLowerCase() === dir.toLowerCase()) {
                                    let type = mime.getType(name);
                                    type = type ? type.slice(0, type.indexOf('/')) : data['type'];
                
                                    files.push({
                                        id: data['id'],
                                        name: name,
                                        size: size,
                                        type: type,
                                        modified: modified,
                                        link: folderDir !== '/' ? `${rootUrl}/${folderDir}/${data['id']}/~preview` : `${rootUrl}/${data['id']}/~preview`,
                                        shareCode: data['shareCode'],
                                        share: share
                                    });
                                }
                                else if (stats.isDirectory()) {
                                    let link = '/files/my-drive' + (folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`);
                
                                    if ((rootUrl === '/files/my-drive' || rootUrl === '/files') && folderDir.toLowerCase() === dir.toLowerCase()) {
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
                    shareUid: { [Op.like]: `${uid}` }
                },
            }).then(datas => {
                if (datas.length > 0) {
                    for (const [i, data] of datas.entries()) {
                        let root = `public/uploads/files/${data['uid']}`;
                        let directory = path.join(root, data['fullPath']);
                        let shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number).sort((a, b) => {return a - b}) : null;
    
                        if (shareUid && shareUid.indexOf(uid) !== -1) {
                            fs.lstat(directory).then(stats => {
                                let folderDir = directory.replace(/\\/g, '/');
                                folderDir = folderDir.slice(folderDir.indexOf(root) + root.length + 1);
        
                                let name = folderDir.slice(folderDir.lastIndexOf('/') + 1);
                                folderDir = folderDir.length !== name.length ? folderDir.slice(0, folderDir.length - name.length - 1) : '/';
        
                                let modified = moment.duration(moment(new Date).diff(stats['mtime']));
                                modified = modified / (1000 * 60 * 60 * 24) < 1 ? `${modified.humanize()} ago` : moment(stats.mtime).format('DD/MM/YYYY hh:mm a');
                                
                                let size = bytesToSize.convert(stats['size']);
                                size = size === '0 Bytes' ? '--' : size;
        
                                if (rootUrl === '/files/share-drive' && stats.isFile() && folderDir.toLowerCase() === dir.toLowerCase()) {
                                    let type = mime.getType(name);
                                    type = type ? type.slice(0, type.indexOf('/')) : data['type'];
                
                                    files.push({
                                        id: data['id'],
                                        name: name,
                                        size: size,
                                        type: type,
                                        modified: modified,
                                        link: folderDir !== '/' ? `${rootUrl}/${folderDir}/${data['id']}/~preview` : `${rootUrl}/${data['id']}/~preview`,
                                    });
                                }
                                else if (stats.isDirectory()) {
                                    let link = '/files/share-drive' + (folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`);
                
                                    if (rootUrl === '/files/share-drive' && folderDir.toLowerCase() === dir.toLowerCase()) {
                                        files.push({
                                            id: data['id'],
                                            name: name,
                                            size: size,
                                            type: 'folder',
                                            modified: modified,
                                            link: link
                                        });
                                    }
                                    
                                    shareTree.push({
                                        id: data['id'],
                                        name: name,
                                        link: link,
                                        child: folderDir !== '/' ? `/${folderDir}/${name}` : `/${name}`,
                                        parent: folderDir !== '/' ? `/${folderDir}` : '/'
                                    });
                                }
                            }).then(() => {
                                shareTree = shareTree.sort((a, b) => {return a.parent.length - b.parent.length});
                                doneCount += i >= datas.length - 1 ? 1 : 0;
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
    
            setTimeout(() => {
                setInterval(function() {
                    if (doneCount >= 2) {
                        res.render('files/index', {
                            title: 'File Management',
                            files: files,
                            folders: tree,
                            shareFolders: shareTree,
                            breadcrumbs: breadcrumbs,
                            types: Object.keys(mime._types),
                            users: usersAutocomplete,
                            urlRoot: rootUrl,
                            postRoot: req.originalUrl.replace(/\/~addshareuser|\/~copy|\/~delshareuser|~download|\/~move|\/~newfile|\/~newfolder|\/~rename|\/~sharecode|\/~upload/gi, ''),
                        });
    
                        clearInterval(this);
                    }
                });
            }, 50);
        }
    },
    addShareUser: function(req, res) {
        let uid = req.user.id;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
                    errors: errors,
                    shareUser: shareUser,
                    select: fid
                });

                req.flash('error', errors['shareUser']);
                res.redirect(dir === '/' ? `${rootUrl}/~addshareuser` :  `${rootUrl}/${dir}/~addshareuser`);
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
                                        if (data['type'] === 'folder') {
                                            filesFolders.findAll({
                                                where: {
                                                    directory: {[Op.startsWith]: data['fullPath']},
                                                    uid: uid
                                                }
                                            }).then(datas => {
                                                for (const [i, data] of datas.entries()) {
                                                    shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number) : [];

                                                    if (shareUid.indexOf(userId) === -1) {
                                                        shareUid.push(userId);

                                                        shareUid = shareUid.sort(function(a, b) { return a - b });
                                                        shareUid = shareUid.join(',');

                                                        data.update({shareUid: shareUid}).then(() => {
                                                            if (i >= datas.length - 1) {
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
                                                    
                                                                res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                                            }
                                                        });
                                                    }
                                                    else if (i >= datas.length - 1) {
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
                                            
                                                        res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                                    }
                                                }
                                            });
                                        }
                                        else {
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
                                
                                            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                        }
                                    });
                                }
                                else {
                                    req.flash('forms', {
                                        select: fid,
                                        shareUser: shareUser
                                    });

                                    req.flash('error', `Already shared with ${shareUser}.`);
                                    res.redirect(dir === '/' ? `${rootUrl}/~addshareuser` :  `${rootUrl}/${dir}/~addshareuser`);
                                }
                            }
                            else {
                                req.flash('error', 'File or folder can\t be found');
                                res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                            }
                        });
                    }
                    else {
                        req.flash('forms', {
                            shareUser: shareUser,
                            select: fid
                        });
        
                        req.flash('error', `${shareUser} is not a registered user.`);
                        res.redirect(dir === '/' ? `${rootUrl}/~addshareuser` :  `${rootUrl}/${dir}/~addshareuser`);
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    comment: function(req, res) {
        let uid = req.user.id;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~preview|~comments/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.body.fid;
        let comment = req.body.comment;
        let errors = {};

        if (!fid) {
            req.flash('error', 'File can\'t be found.');
            res.redirect(dir === '/' ? `${rootUrl}` : `${rootUrl}/${dir}`);
        }
        else {
            if (!comment) {
                errors['comment'] = 'Comment can\'t be empty.';
            }
            else if (comment.length > 500) {
                errors['comment'] = 'Comment must be less than 500 characters';
            }

            if (Object.keys(errors).length > 0) {
                req.flash('forms', {
                    comment: comment,
                    errors: errors
                });
    
                req.flash('error', errors['comment']);
                res.redirect(dir === '/' ? `${rootUrl}/~preview/~comments` : `${rootUrl}/${dir}/~preview/~comments`);
            }
            else {
                filesFolders.findByPk(fid).then(data => {
                    if (data) {
                        filesFoldersComments.create({
                            comment: comment,
                            fid: fid,
                            fromUid: uid,
                            dateTime: literal('CURRENT_TIMESTAMP')
                        }).then(() => {
                            req.flash('success', 'Comment posted sucessfully.');
                            res.redirect(dir === '/' ? `${rootUrl}/~preview` : `${rootUrl}/${dir}/~preview`);
                        });
                    }
                    else {
                        req.flash('error', 'File can\'t be found.');
                        res.redirect(dir === '/' ? `${rootUrl}/~preview/~comments` : `${rootUrl}/${dir}/~preview/~comments`);
                    }
                });
            }
        }
    },
    copy: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
                errors['copyDir'] = 'Directory path only allow alphanumeric, space, underscore, dash and forward slash.';
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
                res.redirect(dir === '/' ? `${rootUrl}/~copy` :  `${rootUrl}/${dir}/~copy`);
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
    
                                loopRedirect(req, res, rootUrl, dir, i, datas.length, flashMsgs);
                            });
                            
                            if (name !== data['name']) {
                                flashMsgs['success'].push(`${data['name']} copied successfully as ${name}.`);
                            }
                            else {
                                flashMsgs['success'].push(`${name} copied successfully.`);
                            }
                        }).catch(() => {
                            flashMsgs['error'].push(`${name} can't be copied to a subdirectory of itself.`);

                            loopRedirect(req, res, rootUrl, dir, i, datas.length, flashMsgs);
                        });
                    }
                });
            }
            
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    delete: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
                            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                        }
                    }, 50);
                }
            });
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    delShareUser: function(req, res) {
        let uid = req.user.id;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
                                if (data['type'] === 'folder') {
                                    filesFolders.findAll({
                                        where: {
                                            directory: {[Op.startsWith]: data['fullPath']},
                                            uid: uid
                                        }
                                    }).then(datas => {
                                        for (const [i, data] of datas.entries()) {
                                            let shareUid = data['shareUid'] ? data['shareUid'].split(',').map(Number) : [];

                                            for (const [x, uid] of delUids.entries()) {
                                                let z = shareUid.indexOf(parseInt(uid));

                                                if (z > -1) {
                                                    shareUid.splice(z, 1);
                                                    shareUid.join(',');

                                                    shareUid = shareUid.length > 0 ? shareUid : null;

                                                    data.update({ shareUid: shareUid }).then(() => {
                                                        if (i >= datas.length - 1 && x >= delUids.length - 1) {
                                                            if (successMsgs.length > 0) {
                                                                req.flash('success', successMsgs);
                                                            }
                                                
                                                            req.flash('forms', { select: fid });
                                                            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                                        }
                                                    });
                                                }
                                                else if (i >= datas.length - 1) {
                                                    if (successMsgs.length > 0) {
                                                        req.flash('success', successMsgs);
                                                    }
                                        
                                                    req.flash('forms', { select: fid });
                                                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                                }
                                            }
                                        }
                                    });
                                }
                                else {
                                    if (successMsgs.length > 0) {
                                        req.flash('success', successMsgs);
                                    }
                        
                                    req.flash('forms', { select: fid });
                                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                }

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
                            });
                        });
                    }
                    else {
                        req.flash('error', 'File or folder can\t be found.');
                        res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                    }
                });
            }
            else {
                req.flash('error', 'No user selected.');
                res.redirect(dir === '/' ? `${rootUrl}/~delshareuser` : `${rootUrl}/${dir}/~delshareuser`);
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    download: function(req, res) {
        let uid = req.user ? req.user.id: null;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~download/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.params.fid;
        let shareCode = req.params.code;

        if ((fid && uid) || shareCode) {
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
                        req.flash('error', 'You don\'t have permission to download this file.');
                        res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                    }
                    else {
                        let root = `public/uploads/files/${data['uid']}`;
    
                        if (data['type'] === 'folder') {
                            let regex = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
                            let code = crypto.randomBytes(5).toString('hex');
                            let directory = `public/uploads/temp/${code}`;
    
                            while(fs.existsSync(directory) || !regex.test(code)) {
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
                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                }
            });
        }
        else {
            req.flash('error', 'You don\'t have permission to download this file or this file can\'t be found.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    move: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
                errors['moveDir'] = 'Directory path only allow alphanumeric, space, underscore, dash and forward slash.';
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
                res.redirect(dir === '/' ? `${rootUrl}/~move` :  `${rootUrl}/${dir}/~move`);
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
                                    
                                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
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

                                            loopRedirect(req, res, rootUrl, dir, i, datas.length, flashMsgs);
                                        });
                                    });
                                    
                                }).catch(() => {
                                    flashMsgs['error'].push(`${name} can't be moved to a subdirectory of itself.`);

                                    loopRedirect(req, res, rootUrl, dir, i, datas.length, flashMsgs);
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    newfile: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
            errors['filename'] = 'File name only allow alphanumeric, space, underscore and dash.';
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

            res.redirect(dir === '/' ? `${rootUrl}/~newfile` :  `${rootUrl}/${dir}/~newfile`);
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
                            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
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
                    res.redirect(dir === '/' ? `${rootUrl}/~newfile` :  `${rootUrl}/${dir}/~newfile`);
                }
            });
        }
    },
    newfolder: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~newfolder/gi, '') : '/';
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
        else if (dir === '/' && (name.toLowerCase() === 'my-drive' || name.toLowerCase() === 'share-drive')) {
            errors['foldername'] = `${name} folder name is a reserved name in the root directory.`;
        }

        if (Object.keys(errors).length > 0) {
            req.flash('forms', {
                foldername: name,
                errors: errors
            });
            
            req.flash('error', errors['foldername']);
            res.redirect(dir === '/' ? `${rootUrl}/~newfolder` :  `${rootUrl}/${dir}/~newfolder`);
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
                            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
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
                    res.redirect(dir === '/' ? `${rootUrl}/~newfolder` :  `${rootUrl}/${dir}/~newfolder`);
                }
            });
        }
    },
    rename: function(req, res) {
        let uid = req.user.id;
        let root = `public/uploads/files/${uid}/`;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
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
                errors['rename'] = 'File or folder name only allow alphanumeric, space, underscore and dash.';
            }
    
            if (Object.keys(errors).length > 0) {
                req.flash('forms', { rename: name, select: fid, errors: errors });
                res.redirect(dir === '/' ? `${rootUrl}/~rename` :  `${rootUrl}/${dir}/~rename`);
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
                                res.redirect(dir === '/' ? `${rootUrl}/~rename` :  `${rootUrl}/${dir}/~rename`);
                            }
                            else {
                                fs.rename(path.join(root, data['fullPath']), path.join(root, fullPath)).then(() => {
                                    data.update({
                                        name: name + ext,
                                        fullPath: fullPath
                                    });
    
                                    req.flash('success', `${originalName} has been renamed to ${name + ext} successfully.`);
                                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                });
                            }
                        });
                    }
                    else {
                        req.flash('error', 'File can\'t be found.');
                        res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                    }
                });
            }
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    preview: function(req, res) {
        let uid = req.user.id;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/~comments|~preview/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.params.fid;

        if (fid && uid) {
            filesFolders.findOne({ where: {id: fid} }).then(data => {
                let file = null;
                let comments = [];

                if (data) {
                    let root = `public/uploads/files/${data['uid']}/`;
                    let name = data['name'];
                    let ext = name.lastIndexOf('.') > -1 ? name.slice(name.lastIndexOf('.') + 1) : null;

                    file = {
                        id: data['id'],
                        name: data['name'],
                        ext: ext,
                        type: data['type'],
                        link: `/uploads/files/${data['uid']}${data['fullPath']}`
                    };

                    if (data['type'] === 'code' || data['type'] === 'text') {
                        file['content'] = fs.readFileSync(path.join(root, data['fullPath']), 'utf-8');
                    }
                    else if (data['type'] === 'video') {
                        file['mime'] = mime.getType(ext);
                    }

                    filesFoldersComments.findAll({where: { fid: fid }}).then(datas => {
                        if (datas.length > 0) {
                            for (const [i, data] of datas.entries()) {
                                users.findByPk(data['fromUid']).then(user => {
                                    let dateTime = moment.duration(moment(new Date).diff(data['dateTime']));
                                    dateTime = dateTime / (1000 * 60 * 60 * 24) < 1 ? `${dateTime.humanize()} ago` : moment(dateTime).format('DD/MM/YYYY hh:mm a');
    
                                    comments.push({
                                        uid: data['fromUid'],
                                        username: user['username'],
                                        comment: data['comment'],
                                        dateTime: dateTime
                                    });
        
                                    if (i >= datas.length - 1) {
                                        setTimeout(() => {
                                            res.render('files/preview', {
                                                file: file,
                                                comments: comments,
                                                postRoot: req.originalUrl.replace(/\/~comments|\/~preview/gi, ''),
                                                prevUrl: dir === '' || dir === '/' ? `${rootUrl}` : `${rootUrl}/${dir}`
                                            });
                                        }, 50);
                                    }
                                });
                            }
                        }
                        else {
                            res.render('files/preview', {
                                file: file,
                                postRoot: req.originalUrl.replace(/\/~comments|\/~preview/gi, ''),
                                prevUrl: dir === '' || dir === '/' ? `${rootUrl}` : `${rootUrl}/${dir}`
                            });
                        }
                    });
                }
                else {
                    req.flash('error', 'File can\'t be found.');
                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                }
            });
        }
        else {
            req.flash('error', 'You don\'t have permission to view this file.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    sharecode: function(req, res) {
        let uid = req.user.id;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~sharecode/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = parseInt(req.body.fid);
        
        if (fid) {
            filesFolders.findOne({ where: {id: fid, uid: uid} }).then(data => {
                if (data) {
                    let code = null;

                    if (data['shareCode']) {
                        data.update({shareCode: code}).then(data => {
                            if (data['type'] === 'folder') {
                                filesFolders.findAll({
                                    where: { 
                                        directory: { [Op.startsWith]: data['fullPath'] }
                                    }
                                }).then(datas => {
                                    for (const [i, d] of datas.entries()) {
                                        d.update({ shareCode: code }).then(() => {
                                            if (i >= datas.length - 1) {
                                                req.flash('forms', { select: [fid] });
                                                req.flash('success', `${data['name']} share link removed successfully.`);
                                                res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                req.flash('forms', { select: [fid] });
                                req.flash('success', `${data['name']} share link removed successfully.`);
                                res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                            }
                        });
                    }
                    else {
                        filesFolders.findAll({ attributes: ['shareCode'] }).then(shareCodes => {
                            let regex = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;

                            while (!code || !regex.test(code) || shareCodes.indexOf(code) > -1) {
                                code = crypto.randomBytes(5).toString('hex');
                            }
    
                            data.update({ shareCode:  code}).then(data => {
                                if (data['type'] === 'folder') {
                                    filesFolders.findAll({
                                        where: {
                                            directory: { [Op.startsWith]: data['fullPath'] }
                                        }
                                    }).then(datas => {
                                        for(const [i, d] of datas.entries()) {
                                            d.update({ shareCode: code }).then(() => {
                                                if (i >= datas.length - 1) {
                                                    req.flash('forms', { select: [fid] });
                                                    req.flash('success', `${data['name']} share link created successfully.`);
                                                    res.redirect(dir === '/' ? rootUrl :  `${rootUrl}/${dir}/~sharecode`);
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    req.flash('forms', { select: [fid] });
                                    req.flash('success', `${data['name']} share link created successfully.`);
                                    res.redirect(dir === '/' ? rootUrl :  `${rootUrl}/${dir}/~sharecode`);
                                }
                            });
                        });
                    }
                }
                else {
                    req.flash('error', 'File or folder can\'t be found.');
                    res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
                }
            });
        }
        else {
            req.flash('error', 'No file or folder selected.');
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    },
    sharedIndex: function(req, res) {
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~shared/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let shareCode = req.params['sharecode'];
        
        if (!shareCode) {
            req.flash('error', 'You don\'t have permission to view this file or folder.');
            res.redirect('/');
        }
        else {
            filesFolders.findAll({ where: { shareCode: shareCode } }).then(datas => {
                let files = [];
                
                if (datas.length > 0) {
                    for (const [i, data] of datas.entries()) {
                        let root = `public/uploads/files/${data['uid']}/`;
                        let directory = path.join(root, data['fullPath']);
                        
                        fs.lstat(directory).then(stats => {
                            let folderDir = directory.replace(/\\/g, '/');
                            folderDir = folderDir.slice(folderDir.indexOf(root) + root.length);
    
                            let name = folderDir.slice(folderDir.lastIndexOf('/') + 1);
                            folderDir = folderDir.length !== name.length ? folderDir.slice(0, folderDir.length - name.length - 1) : '/';
    
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
                                    link: folderDir !== '/' ? `/files/${shareCode}/${data['id']}/${folderDir}/~spreview` : `/files/${shareCode}/${data['id']}/~spreview`,
                                });
                            }
                            else if (stats.isDirectory()) {
                                if (folderDir.toLowerCase() === dir.toLowerCase()) {
                                    files.push({
                                        id: data['id'],
                                        name: name,
                                        size: size,
                                        type: 'folder',
                                        modified: modified,
                                        link: folderDir !== '/' ? `/files/${shareCode}/${folderDir}/${name}/~shared` : `/files/${shareCode}/${name}/~shared`
                                    });
                                }
                            }

                            if (i >= datas.length - 1) {
                                setTimeout(() => {
                                    res.render('files/sharedIndex', {
                                        files: files,
                                        shareCode: shareCode
                                    });
                                }, 50);
                            }
                        });
                    }
                }
            });
        }
    },
    sharedPreview: function(req, res) {
        let dir = req.params['dir'] !== undefined ? '/' + req.params['dir'].replace(/|~spreview/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;

        let fid = req.params.fid;
        let shareCode = req.params.sharecode;

        if (fid && shareCode) {
            filesFolders.findOne({
                where: {
                    id: fid,
                    shareCode: shareCode
                }
            }).then(data => {
                let file = null;
                let comments = [];

                if (data) {
                    let root = `public/uploads/files/${data['uid']}/`;
                    let name = data['name'];
                    let ext = name.lastIndexOf('.') > -1 ? name.slice(name.lastIndexOf('.') + 1) : null;

                    file = {
                        id: data['id'],
                        name: data['name'],
                        ext: ext,
                        type: data['type'],
                        link: `/uploads/files/${data['uid']}${data['fullPath']}`
                    };

                    if (data['type'] === 'code' || data['type'] === 'text') {
                        file['content'] = fs.readFileSync(path.join(root, data['fullPath']), 'utf-8');
                    }
                    else if (data['type'] === 'video') {
                        file['mime'] = mime.getType(ext);
                    }

                    filesFoldersComments.findAll({where: { fid: fid }}).then(datas => {
                        if (datas.length > 0) {
                            for (const [i, data] of datas.entries()) {
                                users.findByPk(data['fromUid']).then(user => {
                                    let dateTime = moment.duration(moment(new Date).diff(data['dateTime']));
                                    dateTime = dateTime / (1000 * 60 * 60 * 24) < 1 ? `${dateTime.humanize()} ago` : moment(dateTime).format('DD/MM/YYYY hh:mm a');
    
                                    comments.push({
                                        uid: data['fromUid'],
                                        username: user['username'],
                                        comment: data['comment'],
                                        dateTime: dateTime
                                    });
        
                                    if (i >= datas.length - 1) {
                                        setTimeout(() => {
                                            res.render('files/sharedPreview', {
                                                file: file,
                                                comments: comments,
                                                postRoot: req.originalUrl.replace(/\/~comments|\/~preview/gi, ''),
                                                prevUrl: dir === '' || dir === '/' ? `/files/${shareCode}/~shared` : `/files/${shareCode}/${dir}/~shared`
                                            });
                                        }, 50);
                                    }
                                });
                            }
                        }
                        else {
                            res.render('files/sharedPreview', {
                                file: file,
                                postRoot: req.originalUrl.replace(/\/~comments|\/~preview/gi, ''),
                                prevUrl: dir === '' || dir === '/' ? `/files/${shareCode}/~shared` : `/files/${shareCode}/${dir}/~shared`
                            });
                        }
                    });
                }
                else {
                    req.flash('error', 'File can\'t be found.');
                    res.redirect('/');
                }
            });
        }
        else {
            req.flash('error', 'You don\'t have permission to view this file.');
            res.redirect('/');
        }
    },
    upload: function (req, res) {
        let uid = req.user.id;
        let root = 'public/uploads/files/' + uid;
        let rootUrl = req.params[0] ? `/files${req.params[0]}` : `/files`;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile/gi, '') : '/';
        dir = dir ? dir : '/';
        dir = dir.length > 1 && dir[0] === '/' ? dir.slice(1) : dir;
        dir = dir.length > 1 && dir[dir.length - 1] === '/' ? dir.slice(0, -1) : dir;
        
        let files = req.files;
        let flashMsgs = {success: [], warning: [], error: []};
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

                            loopRedirect(req, res, rootUrl, dir, i, files.length, flashMsgs, uploadsId);
                        });
                    }
                    else {
                        uploadsId.push(data['id']);
                        flashMsgs['warning'].push(`${fileName} has been replaced.`);

                        loopRedirect(req, res, rootUrl, dir, i, files.length, flashMsgs, uploadsId);
                    }
                });
            });
        }
    }
}

const loopRedirect = (req, res, rootUrl, dir, i, lengthCheck, flashMsgs, selectIds = []) => {
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
            
            res.redirect(dir === '/' ? rootUrl : `${rootUrl}/${dir}`);
        }
    }, 50);
}