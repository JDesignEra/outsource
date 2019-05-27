const mysql = require('./dbConfig'); 
const users = require('../models/users');
const comments = require('../models/comments');
const files = require('../models/files');
const services = require('../models/services');
 
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