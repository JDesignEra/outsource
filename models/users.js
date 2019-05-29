<<<<<<< Updated upstream:models/users.js
const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const users = db.define('user', {
    uid:{
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
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
=======
const Sequelize = require('sequelize');
const db = require('../config/dbConfig');


const Users = db.define('user', {
    uid:{
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
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

module.exports = Users;
>>>>>>> Stashed changes:models/user.js
