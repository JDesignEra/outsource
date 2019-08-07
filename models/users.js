
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
    googleId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    gAccessToken: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    gExpire: {
        type: Sequelize.DATE,
        allowNull: true
    },
    facebookId: {
        type: Sequelize.STRING,
        allowNull: true,
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
        type: Sequelize.TEXT('long'),
    },
    following: {
        type: Sequelize.TEXT('long'),
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

    //Notification
    // notifications: {
    //     type: Sequelize.TEXT('long')
    // }
});
module.exports = users;
