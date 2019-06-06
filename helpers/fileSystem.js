const { rename } = require('fs');

module.exports = {
    move: function(fromPath, toPath ) {
        let flag = rename(fromPath, toPath, function(err) {
            if (err) {
                console.error('Move Error: ' + err);
            }
        });
    }
}