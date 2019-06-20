
const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const users = db.define('user', {
    id:{
        type: Sequelize.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    accType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING
    },
    paypal: {
        type: Sequelize.STRING,
    },
    website: {
        type: Sequelize.STRING
    },
    social_media: {
        type: Sequelize.STRING
    },
    dob:{
        type: Sequelize.DATE
    },
    gender: {
        type: Sequelize.STRING
    },
    jobTitle: {
        type: Sequelize.STRING
    },  
    skills:{
        type: Sequelize.STRING
    },
    bio: {
        type: Sequelize.STRING(5000)
    }
});
module.exports = users;
