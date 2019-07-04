const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

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
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    fromUid: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = filesFoldersComment;