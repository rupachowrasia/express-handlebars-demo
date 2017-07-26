var path = require('path');

var express = require('express');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var session = require('express-session');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var passport = require('passport');
//var passportLocal = require('passport-local');
var localStrategy = require('passport-local').Strategy;
//var passportHttp = require('passport-http');

var mongo = require('mongodb');
var mongoose = require('mongoose');

// Connect to db
mongoose.connect('mongodb://localhost/testdb');
var db = mongoose.connection;

// Includes the routes
var routes = require('./routes/index');
var users = require('./routes/users');

// Init the app
var app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// bodyParser and cookieParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
	'secret': 'thisissecerettext',
	'saveUninitialized' : true,
	'resave' : true
}));

// Paasport init
app.use(passport.initialize());
app.use(passport.session());
 
// Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global vars for flash messages
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Middleware for routes file
app.use('/', routes);
app.use('/users', users);

// Set the port and start the server
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port ' + app.get('port'));
});