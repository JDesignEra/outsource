const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const users = require('./users');

const filesFolders = db.define('files_folder', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    type: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    shareCode: {
        type: Sequelize.TEXT
    },
    sharedWith: {
        type: Sequelize.INTEGER,
        references: {
            model: users,
            key: 'id'
        }
    },
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'id'
        }
    }
});

module.exports = filesFolders;