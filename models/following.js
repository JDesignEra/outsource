const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const following = db.define('following', {
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
    fid: {
        type: Sequelize.INTEGER
    }
});

module.exports = following;