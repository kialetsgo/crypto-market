'use strict'
const mongoose = require('mongoose')
const { stringify } = require('uuid')

const userAccountSchema = new mongoose.Schema({
    email: {
        required: true,
        unique: true,
        type: String
    },
    watchlist: [
        {
            coin_name: String,
            symbol: String,
            slug: String,
            price: Number,
        }
    ],
    coins: [
        {
            coin_name: String,
            symbol: String,
            slug: String,
            rank: String,
            quantity: {
                type: Number,
                min: 1,
            }
        },
    ],
    acc_balance: {
        required: true,
        type: Number,
        default: 20000,
    },
    created_at: {
        required: true,
        type: Date,
        default: Date.now
    },
    updated_at: {
        required: true,
        type: Date,
        default: Date.now
    }
})

const userAccountModel = mongoose.model('user_accounts', userAccountSchema)

module.exports = userAccountModel