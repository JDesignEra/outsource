const Sequelize = require('sequelize');
const db = require('./db');

const sequelize = new Sequelize(db.database, db.username, db.password, {
    host: db.host,
    dialect: 'mysql',
    define: {
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        accquire: 30000,
        idle: 10000
    },
    logging: false
});

module.exports = sequelize;