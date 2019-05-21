const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Services = db.define('service', {
    name: {
        type: Sequelize.STRING
    },
    desc: {
        type: Sequelize.STRING(2000)
    },
    price: {
        type: Sequelize.DECIMAL
    },
    posterURL: {
        type: Sequelize.STRING
    }
});
module.exports = Services;