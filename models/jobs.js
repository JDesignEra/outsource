const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const users = require('./users');

const jobs = db.define('job', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER
    },
    uname: {
        type: Sequelize.STRING
    },
    sid : {
        type: Sequelize.INTEGER
    },
    cid: {
        type: Sequelize.INTEGER
    },
    cname: {
        type: Sequelize.STRING
    },
    date: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    remarks: {
        type: Sequelize.STRING(2000)
    },
    salary: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING
    }
});

module.exports = jobs;