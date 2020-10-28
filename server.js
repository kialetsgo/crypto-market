'use strict'
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
const coinControllers = require('./controllers/coinController')
const userControllers = require('./controllers/userController')

// mongoose 
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
mongoose.set('useFindAndModify', false)

// enable dependencies to run on express 
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: "app_session",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } // 3600000ms = 3600s = 60mins, cookie expires in an hour
})) // secure: true is only for secure webpages (SSL)
app.use(setUserVarMiddleware)

/// MAIN ROUTES ///
// index route
app.get('/', coinControllers.listProducts)

/// REGISTER/LOGIN ROUTES ///
// user registration form 
app.get("/user/register", guestOnlyMiddleware, userControllers.showRegistrationForm)
// user registration
app.post('/user/register', guestOnlyMiddleware, userControllers.register)
// user login
app.get('/user/login', guestOnlyMiddleware, userControllers.showLoginForm)
// user login route
app.post('/user/login', guestOnlyMiddleware, userControllers.login)

/// USER-ONLY ROUTES ///
// user dashboard
app.get('/user/dashboard', authenticatedOnlyMiddleware, userControllers.dashboard)
// add to watchlist
app.post('/user/watchlist/:slug', authenticatedOnlyMiddleware, userControllers.addToWatchlist)
// user transaction form
app.get('/user/transaction/:slug', authenticatedOnlyMiddleware, userControllers.showTransactionForm)
// user purchase
app.post('/user/transaction/:slug', authenticatedOnlyMiddleware, userControllers.buyCoins)

// user logout
app.post('/user/logout', authenticatedOnlyMiddleware, userControllers.logout)


// connect to DB, then inititate Express app
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(response => {
        // DB connected successfully
        console.log('DB connection successful')

        app.listen(process.env.PORT || port, () => {
            console.log(`Crypto Market app listening on port: ${port}`)
        })
    })
    .catch(err => {
        console.log(err)
    })

function guestOnlyMiddleware(req, res, next) {
    // check if user is logged in, 
    // if logged in. redirect back to dashboard
    if (req.session && req.session.user) {
        res.redirect('/user/dashboard')
        return // it works without return as well
    }
    next()

}
function setUserVarMiddleware(req, res, next) {
    // default user template variable
    res.locals.user = null

    // check if req.session.user is set, 
    // if set, template user var will be set as well
    if (req.session && req.session.user) {
        res.locals.user = req.session.user
    }
    next()
}

function authenticatedOnlyMiddleware(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect('/user/login')
        return
    }
    next()
}