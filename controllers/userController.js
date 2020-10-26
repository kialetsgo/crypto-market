const uuid = require('uuid')
const SHA256 = require("crypto-js/sha256")
const UserModel = require('../models/users')
const coinModel = require('../models/testmodels')
const UserAccountModel = require('../models/usersAccount')
const jsdom = require("jsdom");


const controllers = {
    showRegistrationForm: (req, res) => {
        res.render('users/register', {
            pageTitle: 'Register as a User'
        })
    },

    showLoginForm: (req, res) => {
        res.render('users/login', {
            pageTitle: 'User Login'
        })
    },
    register: (req, res) => {
        // validate the users input
        // not implemented yet, try on your own

        UserModel.findOne({
            email: req.body.email
        })
            .then(result => {
                // if found in DB, means email has already been taken, redirect to registration page
                if (result) {
                    res.redirect('/user/register')
                    return
                }

                // no document found in DB, can proceed with registration

                // generate uuid as salt
                const salt = uuid.v4()

                // hash combination using bcrypt
                const combination = salt + req.body.password

                // hash the combination using SHA256
                const hash = SHA256(combination).toString()

                // create user in DB
                UserModel.create({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    pwsalt: salt,
                    hash: hash
                })
                    .then(createResult => {
                        UserAccountModel.create({
                            email: createResult.email,
                            coins: []
                        })
                        res.redirect('/user/dashboard')
                    })
                    .catch(err => {
                        console.log(err)
                        res.redirect('/user/register')
                    })
            })
            .catch(err => {
                console.log(err)
                res.redirect('/user/register')
            })
    },
    login: (req, res) => {
        //validate input here on your own

        // gets user with the given email
        UserModel.findOne({
            email: req.body.email
        })
            .then(result => {
                // check if result is empty, if it is, no user, so login fail, redirect to login page
                if (!result) {
                    res.redirect('/user/login')
                    return
                }
                // combine DB user salt with given password, and apply hash algo
                const hash = SHA256(result.pwsalt + req.body.password).toString()

                // check if password is correct by comparing hashes
                if (hash !== result.hash) {
                    res.redirect('/user/login')
                    return
                }

                // login successful

                // set session user
                // console.log(req.session)
                req.session.user = result
                // console.log(req.session)
                res.redirect('/user/dashboard')
            })
            .catch(err => {
                console.log(err)
                res.redirect('/user/login')
            })
    },
    dashboard: (req, res) => {
        UserAccountModel.findOne({
            email: req.session.user.email
        })
            .then(userResult => {
                console.log('dashboard')
                if (!userResult) {
                    res.redirect('/user/login')
                    return
                }
                res.render('users/dashboard', {
                    pageTitle: "Dashboard",
                    accountDetails: userResult
                })
            })
            .catch(err => {
                console.log(err)
                res.redirect('/user/login')
            })
    },
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/user/login')
    },
    showTransactionForm: (req, res) => {
        let selectedCoinSlug = req.params.slug
        let selectedCoin = coinModel.data.find(item => item.slug === selectedCoinSlug)
        res.render('users/transaction', {
            pageTitle: "Transaction Form",
            item: selectedCoin,
        })
    },
    updateUserPortfolio: (req, res) => {
        let selectedCoinSlug = req.params.slug
        let selectedCoin = coinModel.data.find(item => item.slug === selectedCoinSlug)

        let newCoin = {
            coin_name: selectedCoin.name,
            quantity: req.body.qty,
            symbol: selectedCoin.symbol,
            slug: selectedCoin.slug,
            rank: selectedCoin.cmc_rank,
            purchase_price: selectedCoin.quote.USD.price,
        }

        UserModel.findOne({
            email: req.session.user.email
        })
            .then(userResult => {
                if (!userResult) {
                    res.redirect('/user/login')
                    return
                }
                UserAccountModel.findOne({
                    coins: {
                        $elemMatch: {
                            slug: selectedCoinSlug
                        }
                    }
                })
                    .then(slugResult => {
                        console.log("nice slug result")
                        if (!slugResult) {
                            UserAccountModel.findOneAndUpdate({
                                email: req.session.user.email,
                            }, {
                                $push: { coins: newCoin }
                            })
                                .then(newCoinResult => {
                                    res.redirect('/user/dashboard')
                                })
                                .catch(err => {
                                    console.log(err)
                                })
                        }
                        else {
                            UserAccountModel.findOneAndUpdate({
                                slugResult: {
                                    $elemMatch: {
                                        slug: selectedCoinSlug
                                    }
                                }
                            },
                                {
                                    coins: [{
                                        coin_name: selectedCoin.name,
                                        quantity: slugResult.qty + req.body.qty,
                                        symbol: selectedCoin.symbol,
                                        slug: selectedCoin.slug,
                                        rank: selectedCoin.cmc_rank,
                                        purchase_price: selectedCoin.quote.USD.price,
                                    },]
                                })
                                .then(createResult => {
                                    console.log("nice create result")
                                    res.redirect('/')
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.redirect('/user/login')
                                })
                        }
                    })
            })
            .catch(err => {
                console.log(err)
                res.redirect('/user/login')
            })

    }
}


module.exports = controllers
