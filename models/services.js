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
    name: {
        type: Sequelize.STRING,
        allowNull: false
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
    views: {
        type: Sequelize.INTEGER
    },
    date: {
        type: Sequelize.STRING
    },
    time: {
        type: Sequelize.STRING
    }
});

module.exports = services;