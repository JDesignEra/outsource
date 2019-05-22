//Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

//Routes
const mainRoute = require('./routes/main');
const servicesRoute = require('./routes/services');
const userRoute = require('./routes/user');


//DB set up
const outsourceDB = require('./config/DBConnection');
outsourceDB.setUpDB(false);

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file



const app = express();

//==================================================================================================================================//
//==================================================================================================================================//


//Session Handling
app.use(session({
	key: 'outsource_session',
	secret: 'tojiv',
	store: new MySQLStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,
		// The maximum age of a valid session; milliseconds:
		expiration: 900000,
	}),
	resave: false,
	saveUninitialized: false,
}));




//Handlebars
app.engine('handlebars', exphbs({ 
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');



// Set static folder
app.use(express.static(path.join(__dirname, 'public')))




//Routes Part 2
app.use('/', mainRoute);
app.use('/services', servicesRoute);
app.use('/user', userRoute);

const PORT = 5000;
// Starts the server and listen to port 5000
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});