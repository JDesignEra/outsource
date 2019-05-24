const express = require('express');
const path = require('path');
const session = require('express-session');

const mySqlStore = require('express-mysql-session'); 
const db = require('./config/db');

const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const mainRoute = require('./routes/main');
const servicesRoute = require('./routes/services');
const userRoute = require('./routes/user');
const fileRoute = require('./routes/files');

const outsourceDB = require('./config/dbConnection'); 
outsourceDB.setUpDB(false); 

const app = express(); 

// Session
app.use(session({ 
	key: 'outsource_session', 
	secret: 'tojiv', 
	store: new mySqlStore({ 
		host: db.host, 
		port: 3306, 
		user: db.username, 
		password: db.password, 
		database: db.database, 
		clearExpired: true, 
		checkExpirationInterval: 900000, 
		expiration: 900000, 
	}), 
	resave: false, 
	saveUninitialized: false, 
}));

// Handlebars
app.engine('handlebars', exphbs({  
	defaultLayout: 'main',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: [
		__dirname + '/views/partials',
		__dirname + '/views/partials/main',
	]
})); 
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', mainRoute); 
app.use('/services', servicesRoute); 
app.use('/user', userRoute);
app.use('/files', fileRoute);

app.listen(5000, () => {
	console.log(`Server started on port 5000`);
});