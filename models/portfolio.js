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
        type: Sequelize.INTEGER
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
        type: Sequelize.TEXT('long'),
        allowNull:true,
    }

});

module.exports = portfolio;