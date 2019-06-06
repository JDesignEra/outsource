const mysql = require('./dbConfig'); 
const users = require('../models/users');
const portfolio = require('../models/portfolio');
const filesFolders = require('../models/filesFolders');
const services = require('../models/services');
const profileComments = require('../models/profileComments');
const filesFoldersComments = require('../models/filesFoldersComments');
 
const setUpDB = (drop) => { 
    mysql.authenticate() 
        .then(() => { 
            console.log('outsource database connected.'); 
        }) 
        .then(() => { 
            mysql.sync({ 
                force: drop 
            }).then(() => { 
                console.log('Create tables if none exists.') 
            }).catch(err => console.log(err)) 
        }) 
        .catch(err => console.log('Error: ' + err)); 
}; 
 
module.exports = { setUpDB } 