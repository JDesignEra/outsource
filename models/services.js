const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Services = db.define('service', {
    sid: {
        type: Sequelize.INTEGER,
        primaryKey = true,
        allowNull = false
    },
    uid: {
        type: Sequelize.INTEGER,
        references: {
            model: user,
            key: "uid"
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull = false
    },
    desc: {
        type: Sequelize.STRING(2000)
    },
    price: {
        type: Sequelize.DECIMAL,
        allowNull = false
    },
    posterURL: {
        type: Sequelize.STRING,
    },
    category: {
        type: Sequelize.STRING,
        allowNull = false
    }
});

module.exports = Services;