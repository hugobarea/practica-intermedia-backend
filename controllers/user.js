/* Dependencias */
const { userModel } = require('../models');
const { tokenSign, verifyToken } = require('../utils/handleJwt.js');
const { encrypt, compare } = require('../utils/handlePassword.js');

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

const validateUser = async (req, res) => {

    /* Sacamos el token JWT y el código que ha pasado el usuario */
    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);
    const { code } = req.body; 

    const user = await userModel.findById(dataToken._id);

    /* Verificamos que el código que ha pasado el usuario sea igual que el que hay guardado en base de datos */
    if(code === user.code) {
        await userModel.findByIdAndUpdate(dataToken._id, { status: 1 });
        res.status(200).send("ACK");
    } else {
        /* Si no coincide incrementamos los attempts en 1 */
        await userModel.findByIdAndUpdate(dataToken._id, { $inc: { attempts: 1 } });
        res.status(400).send("INVALID_CODE");
    }
}

const loginUser = async (req, res) => {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });

    if(user == null) {
        res.status(404).send("NOT FOUND");
        return;
    }

    if(user.status != 1) {
        res.status(401).send("NOT VALIDATED");
        return;
    }

    if(!await compare(password, user.password)) {
        res.status(404).send("NOT FOUND");
        return;
    }

    /* Si hemos llegado aqui ya sabemos que hay un usuario valido */

    const token = await tokenSign(user);
    const data = {
        token: token,
        user: {
            email: user.email,
            role: user.role,
            _id: user._id,
            name: user.name /* solo lo devuelve si lo tiene, un usuario registrado no tiene por que tener un name */
        }
    };

    res.status(200).send(data);
}

const updateUser = async (req, res) => {

        /* Sacamos los campos de la petición */
        const { email, name, surnames, nif } = req.body;

        /* Sacamos el token JWT que ha pasado el usuario */
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);

        /* Actualizamos el usuario con los datos nuevos y lo enviamos */
        const updatedUser = await userModel.findByIdAndUpdate(dataToken._id, { name: name, surnames: surnames, nif: nif},
            {new: true}, /* para asegurarnos que devuelve el usuario actualizado*/
        ).select("-password");

        console.log(updatedUser);
        res.status(200).send(updatedUser);

}

module.exports = { registerUser, validateUser, loginUser, updateUser }