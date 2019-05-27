const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Comments = db.define('comment', {
    uid: {
        type: Sequelize.INTEGER,
        references: {
            model: user,
            key: "uid"
        }
    },
    fromUid: {
        type: Sequelize.INTEGER,
        references: {
            model: user,
            key: "uid"
        }
    },
    comments: {
        type: Sequelize.STRING(2000)
    }
});

module.exports = Comments;