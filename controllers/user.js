/* Dependencias */
const { userModel } = require('../models');

// Necesita email y password
const registerUser = (req, res) => {
    
    const { email, password } = req.body;
    
    /* Se crea el objeto user, los intentos y el estado se ponen por defecto */
    const user = {
        email: email,
        password: password,
        code: "0000",
    };

    userModel.create(user);

    res.status(201).send(user);
}

const loginUser = (req, res) => {
    res.send("Controlador implementado");
}

module.exports = { registerUser, loginUser }