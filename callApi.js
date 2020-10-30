const axios = require('axios')
const { response } = require('express')

async function axiosTest() {
    const response = await axios({
        method: 'GET',
        url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        qs: {
            'start': '1',
            'limit': '5000',
            'convert': 'USD'
        },
        headers: {
            'X-CMC_PRO_API_KEY': '86de4343-e7d2-4199-9747-f0bc33dafe48'
        },
        json: true,
        gzip: true
    })
    return response.data
}
module.exports = axiosTest



