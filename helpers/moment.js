const moment = require('moment');

module.exports = {
    formatDate: function(date, format) {
        return moment(date).format(format);
    },

    currYear: function(date) {
        return moment(date).format('YYYY');
    }
};