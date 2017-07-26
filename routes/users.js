var express = require('express');
var router = express.Router();

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	//validation
	req.checkBody('name', 'Name is required!').notEmpty();
	req.checkBody('username', 'Username is required!').notEmpty();
	req.checkBody('email', 'Email is required!').notEmpty();
	req.checkBody('email', 'Email is not valid!').isEmail();
	req.checkBody('password', 'Password is required!').notEmpty();
	req.checkBody('password2', 'Password is do not match!').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		res.render('register', {
			errors: errors
		});
	} else {
		var newUser = new User({
			name : name,
			username : username,
			email : email,
			password : password
		});

		User.createUser(newUser, function(err, data){
			if(err) throw err;
			console.log(data);
		});

		req.flash('success_msg', 'You are registered and can now login!');

		res.redirect('/users/login');
	}

});

passport.use(new localStrategy(function(username, password, done){
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		if(!user) {
			return done(null, false, {message: 'Unknown user'});
		}

		User.comparePassword(password, user.password, function(err, isMatch){
			if(err) throw err;
			if(isMatch) {
				return done(null, user);
			} else {
				return done(null, false, {message: 'Invalid password'});
			}
		});
	});
}));

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.getUserById(id, function(err, user){
		if(err) throw err;
		done(null, user);
	});	
});

// Login User
router.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect : '/users/login', failureFlash : true}), function(req, res){
	res.render('/');
});

// Logout User
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;