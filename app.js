//Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

//Routes
const mainRoute = require('./routes/main');
const servicesRoute = require('./routes/services');

const app = express();

//==================================================================================================================================//
//==================================================================================================================================//

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


const PORT = 5000;
// Starts the server and listen to port 5000
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});