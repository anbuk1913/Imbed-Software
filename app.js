const express = require("express");
const app = express();
const env = require("dotenv");
env.config();
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const passport = require('./config/passport');
const morgan = require('morgan')

const setUser = require('./model/userModel');
require("./config/dbConnect");

const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(morgan("dev"));
app.use(userRouter);
app.use(adminRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "Internal Server Error";
    res.status(statusCode).render("user/errorPage", { statusCode, errorMessage });
});



app.listen(3000, () => {
    console.log("Server Created");
});
