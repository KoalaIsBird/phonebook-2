const mongoose = require('mongoose')

const phoneNumberValidator = [
    phoneNumber => {
        return /^\d{2,3}-\d+$/.test(phoneNumber)
    },
    'phone number is not valid, must have two or three digits, then a dash, then digits'
]

const personSchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        validate: phoneNumberValidator,
        required: true
    }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person
