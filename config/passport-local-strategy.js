const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");


//! authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true
    },
    function (req, email, password, done) {
      //find a user and establish the identity
      User.findOne({ email: email }, function (error, user) {
        if (error) {
          req.flash('error', error);
          //console.log("Error in finding user --> Passport");

          return done(error); //this will report error to passport
        }

        if (!user || user.password != password) {
          req.flash('error', 'Invalid Username/Password')
          //console.log("Invalid Username/Password");

          return done(null, false); // no error but authentication is not done
        }

        return done(null, user); //authentication is done
      });
    }
  )
);


//! serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done){
  done(null, user.id);  //store user id in encrypted formatin the cookies
});


//! deserializing the user from the key in the cookie
passport.deserializeUser(function(id, done){
  User.findById(id, function(error, user){
    if(error){
      console.log("Error in finding user --> Passport");
      return done(error);
    }

    return done(null, user);
  });
});


//! check if the user is authenticated
passport.checkAuthentication = function(req, res, next){
  //if the user is signed in, then pass on the request to the next function(controller's action)
  if(req.isAuthenticated()){
    return next();
  }

  //if the user is not signed in
  return res.redirect('/users/sign-in');
}


//! if authenticated(set the user for the views)
passport.setAuthenticatedUser = function(req, res, next){
  if(req.isAuthenticated()){
    //req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }

  next();
}

module.exports = passport;


