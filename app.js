const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');

const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');

const mySqlStore = require('express-mysql-session');
const db = require('./config/db');
const auth = require('./config/passport');

const outsourceDb = require('./config/dbConnection');
outsourceDb.setUpDB(false);

const hbs = require('./helpers/hbs');

const app = express(); 

// Session
app.use(session({ 
	key: 'outsource_session', 
	secret: 'toOs2019', 
	store: new mySqlStore({ 
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true, 
		checkExpirationInterval: 1 * 24 * 60 * 60 * 10000,	// 24 Hours
		expiration: 1 * 24 * 60 * 60 * 10000
	}),
	resave: false, 
	saveUninitialized: false, 
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
auth.localStrategy(passport);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', passport.authenticate('facebook', {successRedirect: '/profile', failureRedirect: '/login' }));

// Handlebars
app.engine('handlebars', exphbs({
	helpers: hbs,
	defaultLayout: 'base',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: hbs.partialsDirs(__dirname + '/views/partials')
})); 
app.set('view engine', 'handlebars');

// Connect Flash
app.use(flash());

// Render Engine Global Variable
app.use(function(req, res, next) {
	res.locals.user = req.user || null;
	res.locals.url = req.originalUrl;
	res.locals.errors = req.flash('errors');
	res.locals.forms = req.flash('forms');

	if (Object.getOwnPropertyNames(res.locals.errors).length < 1) {
		delete res.locals.errors;
	}
	else {
		res.locals.errors = res.locals.errors[0];
	}

	if (Object.getOwnPropertyNames(res.locals.forms).length < 1) {
		delete res.locals.forms;
	}
	else {
		res.locals.forms = res.locals.forms[0];
	}
	
	toast = {
		'info': req.flash('info'),
		'warning': req.flash('warning'),
		'success': req.flash('success'),
		'error': req.flash('error'),
	}
	
	Object.keys(toast).forEach(key => {
		if (toast[key].length < 1) {
			delete toast[key];
		}
	});

	res.locals.toast = toast;
	
	next();
});

// Body Parser
app.use(bodyParser.urlencoded({
	limit: '5gb',
	extended: true,
	parameterLimit: 50000
}));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override
app.use(methodOverride('_method'));

// Routes
app.use('/', require('./routes/root')); 
app.use('/', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/services', require('./routes/services'));
app.use('/files', require('./routes/files'));

app.listen(port = 5000, () => {
	console.log(`\n\x1b[32mServer started on port ${port}.\x1b[0m`);
});