/* Email, contraseña, código, intentos y estado */

const mongoose = require('mongoose');

const UserScheme = new mongoose.Schema(

    {
        email: String,
        password: String,
        code: String,
        attempts: {
            type: Number,
            default: 0
        },
        status: {
            type: Number,
            default: 0
        },
        role : {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        name: String,
        surnames: String,
        nif: String
    },
    {
        timestamps: true,
        versionKey: false
    }

)

module.exports = mongoose.model('users', UserScheme)