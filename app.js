const express = require("express")
const app = express()
const env = require("dotenv");
const path = require('path')
env.config();
const setUser = require('./model/userModel');
const session = require('express-session');
const methodOverride = require('method-override');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.set('view engine', 'ejs');
require("./config/dbConnect")
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter")

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Use method-override with query parameter
app.use(methodOverride('_method'));

// Set up Passport's Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    // This will store the user's profile in session
    return done(null, profile);
}));
  
// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(userRouter)
app.use(adminRouter)

app.listen(3000,()=>{
    console.log("Server Created")
})


