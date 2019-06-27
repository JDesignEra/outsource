const fs = require('fs');
const path = require('path');
const mime = require('mime');

const bytesToSize = require('../helpers/bytesToSize');
const moment = require('../helpers/moment');
const filesFolders = require('../models/filesFolders');

module.exports = {
    index: function (req, res) {
        let uid = req.user.id;
        let root = './public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile|~newfolder|~upload/gi, '') : '/';
        
        if (!fs.existsSync(root)) {
            fs.mkdirSync(root);
        }

        if (!fs.existsSync(path.join(root, dir))) {
            return res.redirect('/files');
        }

        filesFolders.findAll({ where: {uid: uid}, raw: true }).then(data => {
            let items = [];

            fs.readdirSync(path.join(root, dir)).forEach(el => {
                let stat = fs.lstatSync(path.join(root, dir, el));

                items.push({
                    name: el,
                    size: bytesToSize.convert(stat.size, 0),
                    modified: moment.format(stat.mtime, 'DD/MM/YYYY hh:mm a')
                });

                data.find(obj => {
                    let last = items[items.length - 1];

                    if (obj['name'] === last['name']) {
                        last['id'] = obj['id'];
                        last['type'] = obj['type'];
                        last['shareCode'] = obj['shareCode']
                        last['sharedUid'] = obj['sharedUid'] !== null ? obj['sharedUid'].split(',') : [];
                        last['sharedUsername'] = obj['sharedUsername'] !== null ? obj['sharedUsername'].split(',') : [];
                        last['link'] = encodeURI(last['type'] === 'folder' ? obj['fullPath'] : obj['directory']);

                        items[items.length - 1] = last;

                        if (last['type'] === 'folder') {

                        }
                    }
                });
            });

            // let crumbNames = 
            let breadcrumbs = dir === '/' ? ['root'] : ['root'].concat(dir[dir.length - 1] === '/' ? dir.slice(0, -1).split('/') : dir.split('/'));

            if (breadcrumbs.length > 1) {
                for (let i = 0, n = breadcrumbs.length; i < n; i++) {
                    let link = '/files';
    
                    for (let x = 1; x < n && x <= i && i < n - 1; x++) {
                        console.log(breadcrumbs[i]);
                        link += '/' + breadcrumbs[i];
                    }

                    breadcrumbs[i] = i < n - 1 ? {'name': breadcrumbs[i], 'link': link} : {'name': breadcrumbs[i]};
                }
            }
            else {
                breadcrumbs = [{'name': 'root'}];
            }

            res.render('files/index', {
                title: 'File Management',
                items: Object.keys(items).length !== 0 ? items : null,currentDir: dir === '/' ? 'Home' : dir[dir.length - 1] === '/' ? dir.slice(0, -1).split('/').pop() : dir.split('/'),
                breadcrumbs: breadcrumbs,
                postRoot: req.originalUrl.replace(/\/~newfile|\/~newfolder|\/~upload/gi, ''),
                folders: fs.readdirSync(root)
                        .map(n => path.join(root, n).replace(new RegExp('\\' + path.sep, 'g'), '/'))
                        .filter(p => fs.lstatSync(path.join(p)).isDirectory)
            });
        });
    },
    upload: function (req, res) {
        let uid = req.user.id;
        let files = req.files;
        let root = './public/uploads/files/' + uid;
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile/gi, '') : '/';

        files.forEach(file => {
            let fileName = file['originalname'];
            let type = mime.getType(fileName) || file['mimetype'];
            type = type.slice(0, type.indexOf('/'));

            filesFolders.findOne({
                where: {
                    name: fileName,
                    directory: dir,
                    fullPath: dir + fileName
                }
            }).then(data => {
                if (!data) {
                    filesFolders.create({
                        name: fileName,
                        directory: dir[dir.length - 1] !== '/' ? dir + '/' : dir,
                        fullPath: path.join(dir, fileName).replace(/\\/g, '/'),
                        type: type,
                        uid: uid
                    });
                }

                if (!fs.existsSync(path.join(root, dir))) {
                    fs.mkdirSync(path.join(root, dir));
                }

                fs.renameSync(path.join(file['path']), path.join(root, dir, fileName));
            });
        });

        res.redirect(dir === '/' ? '/files' :  '/files/' + dir);
    },
    newfile: function(req, res) {
        
    },
    newfolder: function(req, res) {
        let uid = req.user.id;
        let folderName = req.body.name;
        let root = './public/uploads/files/' + uid + '/';
        let dir = req.params['dir'] !== undefined ? req.params['dir'].replace(/~newfile/gi, '') : '/';
        
        let regex = /[!@#$%^&*+\=\[\]{}()~;':"\\|,.<>\/?]/;

        if (regex.test(folderName)) {
            req.flash('errors', {'name': 'Folder name can only contain alphanumeric, underscore and dash.'});
            req.flash('forms', { name: folderName });
            
            res.redirect(dir === '/' ? '/files/~newfolder' :  '/files/' + dir + '/~newfolder');
        }
        else {
            filesFolders.findOne({
                where: {
                    name: folderName,
                    directory: dir[dir.length - 1] !== '/' ? dir + '/' : dir,
                    fullPath: path.join(dir, folderName),
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
    }
}