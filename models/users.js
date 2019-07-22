
const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const users = db.define('user', {
    id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    resetPasswordToken: {
        type: Sequelize.STRING,
    },
    resetPasswordExpires:{
        type: Sequelize.DATE,
    },
    accType: {
        type: Sequelize.STRING,
        allowNull: false
    },

    //Profile Name
    jobTitle: {
        type: Sequelize.STRING
    },  
    //Follow Info
    followers: {
        type: Sequelize.INTEGER,
    },
    following: {
        type: Sequelize.INTEGER,
    },

    //Info
    website: {
        type: Sequelize.STRING
    },
    dob:{
        type: Sequelize.DATE
    },
    gender: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    occupation: {
        type: Sequelize.STRING
    },

    bio: {
        type: Sequelize.STRING(5000)
    },
    skills:{
        type: Sequelize.STRING
    },

    //Social Medias and Paypal
    paypal: {
        type: Sequelize.STRING,
    },
    social_media: {
        type: Sequelize.STRING
    },
});
module.exports = users;
