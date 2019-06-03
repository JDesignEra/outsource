const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');

const mySqlStore = require('express-mysql-session'); 
const db = require('./config/db');
const auth = require('./config/passport');

const outsourceDb = require('./config/dbConnection'); 
outsourceDb.setUpDB(false); 

const hbs = require('./helpers/hbs');

const app = express(); 

// CookieParser
app.use(cookieParser());

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

// Passport
app.use(passport.initialize());
app.use(passport.session());
auth.localStrategy(passport);

// Handlebars
app.engine('handlebars', exphbs({
	helpers: hbs,
	defaultLayout: 'base',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: hbs.partialsDirs(__dirname + '/views/partials')
})); 
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json({limit: '5gb'}));
app.use(bodyParser.urlencoded({
	limit: '5gb',
	extended: false,
	parameterLimit: 50000
}));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override
app.use(methodOverride('_method'));

// Routes
app.use('/', require('./routes/main')); 
app.use('/services', require('./routes/services')); 
app.use('/user', require('./routes/user'));
app.use('/files', require('./routes/files'));

app.listen(port = 5000, () => {
	console.log(`Server started on ${port}`);
});
