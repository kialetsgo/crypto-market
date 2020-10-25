// importing dependencies
require('dotenv').config()
const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const session = require('express-session')
const axios = require('axios')
const app = express();
const port = 5000;

// controllers
const productController = require('./controllers/productController')

// mongoose 
// const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
// mongoose.set('useFindAndModify', false)

// enable dependencies to run on express 
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     name: "app_session",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, maxAge: 3600000 } // 3600000ms = 3600s = 60mins, cookie expires in an hour
// })) // secure: true is only for secure webpages (SSL)

/// ROUTES ///

// index route
app.get('/', productController.listProducts)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})