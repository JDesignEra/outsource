const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const portfolio = db.define('portfolio', {
    id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.INTEGER,
        // references: {
        //     model: users,
        //     key: 'id'
        // }
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