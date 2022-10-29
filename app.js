const express = require("express");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
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
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.CLIENT_SECRET,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
    authorizationURL: process.env.AUTH_URL,
    tokenURL: process.env.TOKEN_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://www.ntportal.com/oauth2/callback"
  },
  
  function(accessToken, refreshToken, params, profile, done) {
  
    console.log("accessToken -> \n", accessToken);
    console.log("refreshToken -> \n", refreshToken);
    console.log("params -> \n", params);    
    console.log("profile -> \n", profile);

    user = jwt_decode(params.id_token);
    user.employeeCode = user.upn.split('@')[0];

    console.log("user -> \n", user);

    return done(null, user); 
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.employeeCode);
});
passport.deserializeUser(function(employeeCode, done) {
  if(employeeCode === user.employeeCode){
    done(null, user);
  } else {
    done(null);
  }
});

function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
  }
}

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