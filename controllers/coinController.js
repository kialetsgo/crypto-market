'use strict'
const coinModel = require('../callApi')
const controllers = {
    listProducts: (req, res) => {
        coinModel()
            .then(results => {
                console.log(results)
                res.render('coins/index', {
                    pageTitle: "Crypto Market",
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