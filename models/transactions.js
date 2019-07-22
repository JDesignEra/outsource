const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const transactions = db.define('transaction', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },


    serviceProvider: {
        type: Sequelize.STRING
    },
    freelancerPaypal:{
        type: Sequelize.STRING
    },
    paypalMerchantID:{
        type: Sequelize.STRING,
    },


    paidWith:{
        type:Sequelize.STRING
    },
   
    
    
    paypalTransactionID: {
        type: Sequelize.STRING,
    },
    
    serviceName:{
        type: Sequelize.STRING,
    },
    description:{
        type: Sequelize.STRING,
    },
    price:{
        type: Sequelize.INTEGER,
    },
    currency:{
        type: Sequelize.STRING,
    },
    date: {
        type: Sequelize.STRING
    },

    uid:{
        type: Sequelize.INTEGER
    },



});

module.exports = transactions;