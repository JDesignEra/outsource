const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const servicesfav = db.define('servicefav', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uid: {
        type: Sequelize.INTEGER,
        // references: {
        //     model: users,
        //     key: "id"
        // }
    },
    sid: {
        type: Sequelize.INTEGER
    }
});

module.exports = servicesfav;