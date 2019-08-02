const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const mime = require('./config/mimeConfig');

const mySqlStore = require('express-mysql-session');
const db = require('./config/db');
const auth = require('./config/passport');

const outsourceDb = require('./config/dbConnection');
outsourceDb.setUpDB(false);

const notifications = require('./models/notifications');

const hbs = require('./helpers/hbs');

//PayPal
var paypal = require('paypal-rest-sdk');
paypal.configure({
	mode: 'sandbox', // Sandbox or live
	client_id: 'AU0gOYOjaL87P0T2vYWhfI8H62bKOvPCBxn3fI8kM9VqAueU9-O_0xYWbNVaHXo2FgI6Nmwlb0OPhrAJ',
	client_secret: 'ECG4YL9F_2UWuT5yGSLKO90SfcMfx6aVb7xRzFX3KD42hNj0yenw8BinuTQ6XK3v8sjutoeFzC9LmOZM'
});

const app = express();

// Session
app.use(session({
	secret: '$2y$10$1fs/4go1gKR39/cXficd0eG1qg16/Fj.UxNI4WQelTbWzXOzp8tBS',
	store: new mySqlStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		checkExpirationInterval: 43200000,	// 12 Hours
		expiration: 86400000
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

// Connect Flash
app.use(flash());

// Global Variable
app.use(function (req, res, next) {
	res.locals.user = req.user || null;
	res.locals.url = req.originalUrl;
	res.locals.forms = req.flash('forms');

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

	res.locals.toast = Object.keys(toast).length > 0 ? toast : null;

	// Notifications
	if (res.locals.user != null) {
		notifications.findAll({
			where: { user: res.locals.user.id }
		}).then(notifications => {
			res.locals.notifNum = notifications.length
			next();
		});
	}
	else{
		next();
	}
});

// Body Parser
app.use(bodyParser.urlencoded({
	limit: '100mb',
	extended: true,
	parameterLimit: 50000
}));

// Init mime custom mapping
mime.init();

// Static Folder
app.use(express.static(path.join(__dirname, 'public/uploads'), { maxAge: 0 }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/root'));
app.use('/', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/services', require('./routes/services'));
app.use('/files', require('./routes/files'));
app.use('/jobs', require('./routes/jobs'));
app.use(function (req, res) {
	req.flash('error', 'Page not found.');
	res.redirect('/');
});

app.listen(port = 5000, () => {
	console.log(`\n\x1b[32mServer started on port ${port}.\x1b[0m`);
});