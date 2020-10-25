const mongoose = require('mongoose')

const coinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },

})