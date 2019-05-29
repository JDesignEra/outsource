const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const comments = db.define('comment', {
    cid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER,
        references: {
            model: users,
            key: "uid"
        }
    },
    fromUid: {
        type: Sequelize.INTEGER,
        references: {
            model: users,
            key: "uid"
        }
    },
    comments: {
        type: Sequelize.STRING(2000)
    }
});

module.exports = comments;