const moment = require('moment');

module.exports = {
    format: function(date, format) {
        return moment(date).format(format);
    }
};