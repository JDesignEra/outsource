const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

// ToDo: foreign key for uid
const files = db.define('file', {
    fid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    directory: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    shareCode: {
        type: Sequelize.TEXT
    },
    sharedWith: {
        type: Sequelize.TEXT
    },
    comments: {
        type: Sequelize.TEXT
    }
});

module.exports = files;