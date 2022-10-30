const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const jwt_decode = require('jwt-decode');

require('dotenv').config()

passport.serializeUser(function (user, done) {
    done(null, user.employeeCode);
});

passport.deserializeUser(function (employeeCode, done) {
    if (employeeCode === user.employeeCode) {
        done(null, user);
    } else {
        done(null);
    }
});

function initPassport(){
    
    passport.use(new OAuth2Strategy({
        authorizationURL: process.env.AUTH_URL,
        tokenURL: process.env.TOKEN_URL,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "https://www.ntportal.com/oauth2/callback"
    },

        function (accessToken, refreshToken, params, profile, done) {
            console.log("accessToken -> \n", accessToken);
            console.log("refreshToken -> \n", refreshToken);
            console.log("params -> \n", params);
            console.log("profile -> \n", profile);

            user = jwt_decode(params.id_token);
            user.employeeCode = user.upn.split('@')[0];

            console.log("user -> \n", user);

            // Store user object in cookie session
            return done(null, user);
        }
    ));

}

module.exports = initPassport;