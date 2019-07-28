
const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const notifications = db.define('notification', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    pid: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    date: {
        type: Sequelize.DATE
    },
    category: {
        type: Sequelize.STRING,
    },
    user: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
});
module.exports = notifications;
