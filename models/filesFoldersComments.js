const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const users = require('./users');
const filesFolders = require('./filesFolders');

const filesFoldersComment = db.define('files_folders_comment', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    comment: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    fid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //     model: filesFolders,
        //     key: 'id'
        // }
    },
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //     model: users,
        //     key: 'id'
        // }
    },
    fromUid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //     model: users,
        //     key: 'id'
        // }
    }
});

module.exports = filesFoldersComment;