const express = require("express")
const app = express()
const env = require("dotenv");
const session = require('express-session');
const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter")

env.config();
app.set('view engine', 'ejs'); 
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
}));


app.use(userRouter)
app.use(adminRouter)

app.listen(3000,()=>{
    console.log("Server Created")
})


