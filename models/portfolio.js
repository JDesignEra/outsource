const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Portfolio = db.define('portfolio', {
    pid: {
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
        
    },
    fromUid: {
        type: Sequelize.INTEGER,
        references: {
            model: user,
            key: "uid"
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull:false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull:false, 
    },
    rawDetails: {
        type: Sequelize.STRING,
        allowNull:false, 
    }
});

module.exports = Portfolio;