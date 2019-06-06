const Users = require('../models/users');
const FilesFolders = require('../models/filesFolders');

// ToDo: Moved multer to middleware and make it dynamic (able to set folder and filename), currently testing only
const multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/files');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

let upload = multer({ storage: storage })


module.exports = {
    index: function (req, res) {
        res.render('files/view', {
            title: 'File Management',
            url: req.originalUrl
        });
    },
    upload: function (req, res) {
        upload.array('files')(req, res, (err) => {
            if (err) {
                console.log('Error Occured', err);
                res.send(err);
                return
            }

            res.render('files/view', {
                title: 'File Management',
                url: req.originalUrl
            });
        });
    }
}