const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const profileComments = db.define('profile_comment', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER
    },
    fromUid: {
        type: Sequelize.INTEGER
    },
    comment: {
        type: Sequelize.STRING(2000)
    }
});

module.exports = profileComments;