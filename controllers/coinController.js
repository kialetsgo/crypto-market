'use strict'
const coinModel = require('../callApi')
const controllers = {
    listProducts: (req, res) => {
        coinModel()
            .then(results => {
                res.render('coins/index', {
                    pageTitle: "Cryptocurrencies",
                    pageHeader: "All cryptocurrencies",
                    currencies: results
                })
            })
            .catch(err => {
                console.log(err)
            })

    },
}

module.exports = controllers