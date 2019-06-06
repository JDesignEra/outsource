const multer = require('multer');

module.exports = {
    to: (destination = '/', filename) => {
        multer({ storage: storage(destination, filename)});
    }
}

let storage = function (destination, filename) {
    multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/uploads' + destination)
        },
        filename: function (req, file, cb) {
            cb(null, (filename ? filename : file.fieldname));
        }
    });
}