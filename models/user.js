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
        state: {
            type: ['NOT_VALIDATED', 'VALIDATED'],
            default: 'NOT_VALIDATED'
        },
        role : {
            type: ['user', 'admin'],
            default: 'user'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }

)

module.exports = mongoose.model('users', UserScheme)