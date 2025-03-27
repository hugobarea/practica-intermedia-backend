/* Email, contraseña, código, intentos y estado */

const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete");

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
        nif: String,
        logo: String
    },
    {
        timestamps: true,
        versionKey: false
    }

)

UserScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model('users', UserScheme)