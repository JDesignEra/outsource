const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const portfolio = db.define('portfolio', {
    pid: {
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    fromUid: {
        type: Sequelize.INTEGER,
        references: {
            model: users,
            key: "uid"
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull:false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull:false, 
    },
    rawDetails: {
        type: Sequelize.STRING,
        allowNull:false, 
    }
});

module.exports = portfolio;