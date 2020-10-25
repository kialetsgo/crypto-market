const coinModel = require('../models/testmodels')
const controllers = {
    listProducts: (req, res) => {
        res.render('coins/index', {
            pageTitle: "Crypto Market",
            pageHeader: "All cryptocurrencies",
            currencies: coinModel
        })
    },
}

module.exports = controllers