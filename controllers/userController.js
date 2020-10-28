'use strict'
const uuid = require('uuid')
const SHA256 = require("crypto-js/sha256")
const UserModel = require('../models/users')
const coinModel = require('../models/testmodels')
const UserAccountModel = require('../models/usersAccount')

const controllers = {
    showRegistrationForm: (req, res) => {
        res.render('users/register', {
            pageTitle: 'Register as an User'
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
                        console.log(createResult)
                        UserAccountModel.create({
                            email: createResult.email,
                            coins: []
                        })
                            .then(result => {
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
    addToWatchlist: (req, res) => {
        console.log("hi")
        res.send('.')
        let selectedCoinSlug = req.params.slug

        // console.log(selectedCoinSlug)
        // let result = slugResult.watch.findIndex(item => item.slug === selectedCoinSlug)
        // let resultCoin = slugResult.coins[result]

        // slugResult.coins[result] = {
        //     coin_name: selectedCoin.name,
        //     quantity: resultCoin.quantity + parseInt(req.body.qty),
        //     symbol: selectedCoin.symbol,
        //     slug: selectedCoin.slug,
        //     rank: selectedCoin.cmc_rank,
        // }
        // UserAccountModel.findOne({
        //     email: req.session.user.email
        // })
        //     .then(userAccountResult => {
        //         if (!userAccountResult) {
        //             res.redirect('/user/login')
        //             return
        //         }
        //         UserAccountModel.findOneAndupdate(
        //             {
        //                 email: req.session.user.email
        //             },
        //             {
        //                 $push: { watchlist: newCoin },
        //             })
        //     })
        //     .catch(err => {
        //         console.log(err)
        //         res.redirect('/user/login')
        //     })
    },
    dashboard: (req, res) => {
        UserAccountModel.findOne({
            email: req.session.user.email
        })
            .then(userResult => {
                if (!userResult) {
                    res.redirect('/user/login')
                    return
                }
                res.render('users/dashboard', {
                    pageTitle: "Account",
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
    buyCoins: (req, res) => {
        let selectedCoinSlug = req.params.slug
        let selectedCoin = coinModel.data.find(item => item.slug === selectedCoinSlug)

        let newCoin = {
            coin_name: selectedCoin.name,
            quantity: req.body.qty,
            symbol: selectedCoin.symbol,
            slug: selectedCoin.slug,
            rank: selectedCoin.cmc_rank
        }
        console.log(req.session)
        UserModel.findOne({
            email: req.session.user.email
        })
            .then(userResult => {
                if (!userResult) {
                    res.redirect('/user/login')
                    return
                }
                UserAccountModel.findOne({
                    email: req.session.user.email,
                })
                    .then(userAccountResult => {
                        let acc_balance = userAccountResult.acc_balance
                        UserAccountModel.findOne({
                            email: req.session.user.email,
                            coins: {
                                $elemMatch: {
                                    slug: selectedCoinSlug
                                }
                            }
                        })
                            .then(slugResult => {
                                console.log(slugResult)
                                console.log(selectedCoin)
                                let newAcc_balance = acc_balance - (selectedCoin.quote.USD.price * req.body.qty)
                                if (!slugResult) {
                                    console.log('new')
                                    if (selectedCoin.quote.USD.price * req.body.qty > acc_balance) {
                                        console.log("not enough money")
                                        res.redirect("/user/dashboard")
                                    }
                                    else {
                                        UserAccountModel.findOneAndUpdate({
                                            email: req.session.user.email,
                                        }, {
                                            $push: { coins: newCoin },
                                            acc_balance: newAcc_balance
                                        })
                                            .then(newCoinResult => {
                                                res.redirect('/user/dashboard')
                                            })
                                            .catch(err => {
                                                console.log(err)
                                            })
                                    }
                                }
                                else {
                                    let selectedCoinSlug = req.params.slug
                                    let result = slugResult.coins.findIndex(item => item.slug === selectedCoinSlug)
                                    let resultCoin = slugResult.coins[result]

                                    slugResult.coins[result] = {
                                        coin_name: selectedCoin.name,
                                        quantity: resultCoin.quantity + parseInt(req.body.qty),
                                        symbol: selectedCoin.symbol,
                                        slug: selectedCoin.slug,
                                        rank: selectedCoin.cmc_rank,
                                    }
                                    if (selectedCoin.quote.USD.price * req.body.qty > acc_balance) {
                                        console.log("not enough money")
                                        res.redirect("/user/dashboard")
                                    }
                                    else {
                                        UserAccountModel.findOneAndUpdate({
                                            email: req.session.user.email,
                                            coins: {
                                                $elemMatch: {
                                                    slug: selectedCoinSlug
                                                }
                                            }
                                        },
                                            {
                                                coins: slugResult.coins,
                                                acc_balance: newAcc_balance
                                            })
                                            .then(createResult => {
                                                console.log("updated repeated")
                                                res.redirect('/user/dashboard')
                                            })
                                            .catch(err => {
                                                console.log(err)
                                                res.redirect('/user/login')
                                            })
                                    }

                                }
                            })
                    })
            })
            .catch(err => {
                console.log(err)
                res.redirect('/user/login')
            })

    }
}


module.exports = controllers
