express = require('express');
ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
cookieSession = require('cookie-session');
cookieParser = require('cookie-parser');
csrf = require('csurf');
utils = require('utils');
cors = require('cors');
bodyParser = require('body-parser');
LocalStrategy = require('passport-local');
passport = require('passport'); //note, passport needs to be 0.5.3 for cookie-session to work
Vonage = require('@vonage/server-sdk');

const port = process.env.NERU_APP_PORT || 3001;
const views_path = __dirname + '/views/';
const app = express()
var csrfProtection = csrf({ cookie: true })

//define Passport Local Strategy Callbacks
passport.use(new LocalStrategy(function asyncverify(username, password, cb) {
  //if (application_id != appID) { return cb(null, false, { message: 'Incorrect Application ID or API Key.' }); }
  //username is api key
  //passeord is secret

  apiKey = username
  secret = password

  const vonage = new Vonage({
      apiKey: apiKey,
      apiSecret: secret
  });

  //let's check if the api key and secret works by callng list secrets
  vonage.account.listSecrets(apiKey, async (err, result) => {
      if (!err) {
          //Valid API Secret, Let's go
          return cb(null, { id: "0", username: "Vonage User" })
      } else {
          return cb(null, false, { message: 'Incorrect Application ID or API Key.' })
      }
  });
}));


passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
      cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
      return cb(null, user);
  });
});


//use ejs for templating
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ["secretcat"],
    secure: false,
    resave: false,
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

app.use(function(req, res, next) {
    try{
        res.locals.csrfToken = req.csrfToken();  
    }catch(e){
        //nothing
    }
    next();
});

app.use(passport.authenticate('session'));


//see if service is live, required by Neru
app.get('/', async (req, res, next) => {
    res.send("Vonage Login via Passport Sample");
});

//health check, required by neru
app.get('/_/health', async (req, res) => {
    res.sendStatus(200);
});

//Protected Page
app.get('/protected', csrf(), ensureLoggedIn("./login"), async (req, res, next) => {
    res.render(views_path + "protected.ejs")
});


app.get('/login', csrf(), function (req, res, next) {
    res.render(views_path + "passport_login.ejs", {csrfToken: req.csrfToken()})
});

app.post('/login', csrf(),  passport.authenticate('local', {
    successRedirect: "./protected",
    failureRedirect: './login'
}));

//Logout for cookie session. We have to clear the cookie
app.post('/logout', function (req, res, next) {
    res.clearCookie('session', {path: '/'});
    res.redirect('./login');
});

app.get('/logout', function (req, res, next) {
    res.clearCookie('session', {path: '/'});
    res.redirect('./login');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
