const express = require("express");
const passport = require("passport");
const session = require('express-session');
const jwt_decode = require('jwt-decode');
require('dotenv').config()

const app = express();

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

// Authentication configuration
const initPassport = require('./oauth/passport-oauth');
const authenticationMiddleware = require('./oauth/passport-middleware');

initPassport();

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.CLIENT_SECRET,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', function (req, res){
    res.render('index.html');
});

app.get('/home', authenticationMiddleware(), function (req, res){
  res.render('home.html', {user: req.user.employeeCode});
});

app.get('/contact', authenticationMiddleware(), function (req, res){
  res.render('contact.html');
});

app.get('/login',
  passport.authenticate('oauth2'));

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(process.env.END_SESSION);
  });
});

app.get('/oauth2/callback',
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

// Port
const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server running is on ${port}...`));