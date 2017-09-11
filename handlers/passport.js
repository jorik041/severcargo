const passport = require('passport');
const mongoose = require('mongoose');
const Driver = mongoose.model('Driver');
const Sender = mongoose.model('Sender');
const LocalStrategy = require('passport-local').Strategy;

let options = {
    usernameField: 'phone',
    passwordField: 'password', 
    passReqToCallback: true
};

passport.use('local-driver', new LocalStrategy( options, 
  function(req, phone, password, done) {
    req.session.role  = "driver";
    Driver.findOne({ phone: phone }, function (err, user) {

      if (err) return done(err);
      if (!user) {          
        return done(null, false, { message: 'Пользователя с таким номером телефона не существует.' });
      }

      user.comparePassword(password, function(err, res) {
        if (!res) {
          return done(null, false, { message: 'Введенный пароль неверный' });
        }

        return done(null, user);
      });
    });
  }
));

passport.use(
  'local-sender', new LocalStrategy( options,
    function(req, phone, password, done) {
      req.session.role = "sender";

      Sender.findOne({ phone: phone }, function (err, user) {

        if (err) return done(err);

        if (!user) {          
          return done(null, false, { message: 'Пользователя с таким номером телефона не существует.' });
        }
        
        user.comparePassword(password, function(err, res) {
            if (!res) {
              return done(null, false, { message: 'Введенный пароль неверный'  });
            }

            return done(null, user);
        });
      });
    })
);

passport.serializeUser(function(user, done){
     done(null, user.id);
});

passport.deserializeUser(function(id, done){
   Driver.findById(id, function(err, user){
     if(err) done(err);
       if(user){
         done(null, user);
       } else {
          Sender.findById(id, function(err, user){
          if(err) done(err);
          done(null, user);
       })
     }
   }); 
});


// passport.use(Driver.createStrategy());

// passport.serializeUser(Driver.serializeUser());
// passport.deserializeUser(Driver.deserializeUser());

// passport.use(Sender.createStrategy());

// passport.serializeUser(Sender.serializeUser());
// passport.deserializeUser(Sender.deserializeUser());