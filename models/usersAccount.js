'use strict'
const mongoose = require('mongoose')
const { stringify } = require('uuid')

const userAccountSchema = new mongoose.Schema({
    email: {
        required: true,
        unique: true,
        type: String
    },
    coins: [
        {
            coin_name: {
                type: String
            },
            symbol: String,
            slug: {
                type: String,
            },
            rank: {
                type: String,
            },
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