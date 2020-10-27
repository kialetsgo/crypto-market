const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    first_name: {
        required: true,
        type: String,
        maxlength: 100
    },
    last_name: {
        required: true,
        type: String,
        max: 100
    },
    email: {
        required: true,
        type: String,
        unique: true,
        max: 100
    },
    pwsalt: {
        required: true,
        type: String
    },
    hash: {
        required: true,
        type: String
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

const userModel = mongoose.model('users', userSchema)

module.exports = userModel