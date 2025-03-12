/* Dependencias */
const { userModel } = require('../models');
const { tokenSign } = require('../utils/handleJwt.js');
const { encrypt } = require('../utils/handlePassword.js');

// Necesita email y password
const registerUser = async (req, res) => {
    
    const user = req.body;
    
    /* Se crea el objeto user, los intentos y el estado se ponen por defecto */
    const user_db = {
        email: user.email,
        password: await encrypt(user.password),
        code: Math.floor(100000 + Math.random() * 899999).toString(), // Genera un número aleatorio entre 100000 y 999999
    };

    /* Nos aseguramos de que no exista un usuario con el mismo mail */
    if(await userModel.findOne({ email: user.email})) {
        res.status(409).send("ALREADY_REGISTERED");
        return;
    }

    /* Creamos el usuario en base de datos y la respuesta */
    const createdUser = await userModel.create(user_db);
    const token = await tokenSign(createdUser);

    const data = {
        token: token,
        user: {
            email: createdUser.email,
            status: createdUser.status,
            role: createdUser.role,
            _id: createdUser._id
        }
    };
    res.status(201).send(data);
}

const loginUser = (req, res) => {
    res.send("Controlador implementado");
}

module.exports = { registerUser, loginUser }