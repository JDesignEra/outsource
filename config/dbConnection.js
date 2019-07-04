// dbConnection by Joel
const mysql = require('./dbConfig'); 
const users = require('../models/users');
const portfolio = require('../models/portfolio');
const filesFolders = require('../models/filesFolders');
const services = require('../models/services');
const profileComments = require('../models/profileComments');
const filesFoldersComments = require('../models/filesFoldersComments');
const jobs = require('../models/jobs');
 
const setUpDB = (drop) => { 
    mysql.authenticate() 
        .then(() => { 
            console.log('\x1b[32m\nOutSource database connected.\x1b[0m'); 
        }) 
        .then(() => {
            // filesFolders
            users.hasMany(filesFolders, { foreignKey: 'uid', sourceKey: 'id' });

            filesFolders.belongsTo(users, { foreignKey: 'uid', targetKey: 'id' });

            // filesFoldersComments
            users.hasMany(filesFoldersComments, { foreignKey: 'uid', sourceKey: 'id' });
            users.hasMany(filesFoldersComments, { foreignKey: 'fromUid', sourceKey: 'id' });

            filesFolders.hasMany(filesFoldersComments, { foreignKey: 'fid', sourceKey: 'id' });

            filesFoldersComments.belongsTo(users, { foreignKey: 'uid', targetKey: 'id' });
            filesFoldersComments.belongsTo(users, { foreignKey: 'fromUid', targetKey: 'id' });
            filesFoldersComments.belongsTo(filesFolders, { foreignKey: 'fid', targetKey: 'id' });

            // portfolio
            users.hasMany(portfolio, { foreignKey: 'uid', sourceKey: 'id' });

            portfolio.belongsTo(users, { foreignKey: 'uid', targetKey: 'id' });

            // portfolioComments
            users.hasMany(profileComments, { foreignKey: 'uid', sourceKey: 'id' });
            users.hasMany(profileComments, { foreignKey: 'fromUid', sourceKey: 'id' });

            profileComments.belongsTo(users, { foreignKey: 'uid', targetKey: 'id' });
            profileComments.belongsTo(users, { foreignKey: 'fromUid', targetKey: 'id' });

            // services
            users.hasMany(services, { foreignKey: 'uid', sourceKey: 'id' });

            services.belongsTo(users, { foreignKey: 'uid', targetKey: 'id' });

            mysql.sync({ 
                force: drop 
            }).then(() => { 
                console.log('\x1b[33mCreate tables if none exists.\n\x1b[0m');
            }).catch(err => console.log('\x1b[31m' + err + '\x1b[0m')) 
        }) 
        .catch(err => console.log('\x1b[31mError: ' + err + '\x1b[0m')); 
}; 
 
module.exports = { setUpDB } 