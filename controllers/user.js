/* Dependencias */
const { userModel } = require('../models');

// Necesita email y password
const registerUser = (req, res) => {
    
    const { email, password } = req.body;
    
    /* Se crea el objeto user, los intentos y el estado se ponen por defecto */
    const user = {
        email: email,
        password: password,
        code: Math.floor(100000 + Math.random() * 899999).toString(), // Genera un número aleatorio entre 100000 y 999999
    };

    userModel.create(user);

    res.status(201).send(user);
}

const loginUser = (req, res) => {
    res.send("Controlador implementado");
}

module.exports = { registerUser, loginUser }