const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const portfolio = db.define('portfolio', {
    id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: Sequelize.INTEGER,
        // references: {
        //     model: users,
        //     key: 'id'
        // }
    },
    title: {
        type: Sequelize.STRING,
        allowNull:false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull:false, 
    },
    content: {
        type: Sequelize.TEXT('long'),
        allowNull:false, 
    },

    datePosted:{
        type: Sequelize.DATE,
        allowNull:false,
    },

    views:{
        type: Sequelize.INTEGER,
        allowNull:false,
    },

    likes:{
        type: Sequelize.INTEGER,
        allowNull:false,
    }

});

module.exports = portfolio;