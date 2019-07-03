const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const services = db.define('service', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER,
        // references: {
        //     model: users,
        //     key: "id"
        // }
    },
    desc: {
        type: Sequelize.STRING(2000)
    },
    price: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = services;