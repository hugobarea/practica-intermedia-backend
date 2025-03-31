/* Dependencias */
const { userModel } = require('../models');
const { matchedData } = require("express-validator")
const { tokenSign, verifyToken } = require('../utils/handleJwt.js');
const { encrypt, compare } = require('../utils/handlePassword.js');
const { uploadToPinata } = require('../utils/handleUploadIPFS.js');

require('dotenv').config();


const getUser = async (req, res) => {
    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);
    const user = await userModel.findById(dataToken._id).select("-password");
    res.status(200).send(user);
}

// Necesita email y password
const registerUser = async (req, res) => {
    const { email, password } = matchedData(req);
    
    /* Se crea el objeto user, los intentos y el estado se ponen por defecto */
    const user_db = {
        email: email,
        password: await encrypt(password),
        code: Math.floor(100000 + Math.random() * 899999).toString(), // Genera un número aleatorio entre 100000 y 999999
    };

    /* Nos aseguramos de que no exista un usuario con el mismo mail */
    if(await userModel.findOne({ email: req.email})) {
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

    const { code } = matchedData(req);
    const dataToken = await verifyToken(token);

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

    req = matchedData(req);
    const { email, password } = req;

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
    /* Sacamos el token JWT que ha pasado el usuario */
    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);

    /* Sacamos los campos de la peticion, el email lo quito ya que con el token no haria falta */
    const { name, surnames, nif } = matchedData(req);

    /* Actualizamos el usuario con los datos nuevos y lo enviamos */
    const updatedUser = await userModel.findByIdAndUpdate(dataToken._id, { name: name, surnames: surnames, nif: nif},
        {new: true}, /* para asegurarnos que devuelve el usuario actualizado*/
    ).select("-password");

    console.log(updatedUser);
    res.status(200).send(updatedUser);

}

const deleteUser = async (req, res) => {
    const soft_del = req.query.soft;

    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);

    /* Si tiene valor false, hacemos el hard. De lo contrario, lo hacemos soft para asegurar */
    if(soft_del === "false") {
        await userModel.deleteOne({ _id : dataToken._id });
        res.status(200).send("HARD_DEL");
    } else {
        await userModel.delete({ _id : dataToken._id } );
        res.status(200).send("SOFT_DEL");
    }
}

const addUserLogo = async (req, res) => {
    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);
    
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const pinataResponse = await uploadToPinata(fileBuffer, fileName);
    const ipfsFile = pinataResponse.IpfsHash;
    const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`
    const data = await userModel.findByIdAndUpdate(dataToken._id, { logo: ipfs }, { new: true}).select("-password");
    res.status(200).send(data);
}

const addCompany = async (req, res) => {

    const { company} = matchedData(req);

    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);

    const data = await userModel.findByIdAndUpdate(dataToken._id, { company: company }, { new: true});

    res.status(200).send("ACK");

}

const setRecoverCode = async (req, res) => {
    const { email } = matchedData(req);

    const updatedUser = await userModel.findOneAndUpdate({email: email},
        {reset_code: Math.floor(100000 + Math.random() * 899999).toString()},{ new: true, select: 'email status role _id' });

        if(updatedUser == null) {
            res.status(404).send("NOT_FOUND");
            return;
        }
    
    res.status(200).send({ user: updatedUser });

}

const validatePassReset = async (req, res) => {
    const { email, code} = matchedData(req);

    // Meto gestion de errores mas adelante
    const user = await userModel.findOne({ email: email });

    /* Verificar codigo con base de datos */
    if(code === user.reset_code) {
        await userModel.findOneAndUpdate({email: email}, { reset_code: null, reset_attempts:0 }); /* anulamos el codigo de reseteo */
        const token = tokenSign(user);
        res.status(200).send({ token : token });
    } else {
        await userModel.findOneAndUpdate({email: email}, { $inc: { reset_attempts: 1 } });
        res.status(400).send("INVALID_RESET_CODE");
    }

}

const changePassword = async (req, res) => {
    
    /* Sacamos el id del token */
    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);

    /* Y la pass del body */
    const { password } = matchedData(req);

    const updatedUser = await userModel.findByIdAndUpdate(dataToken._id, { password: await encrypt(password)}, { new: true });
    res.status(200).send("ACK");
    

}

const inviteGuest = async (req, res) => {
    /* En los docs de Ricardo no viene muy claro, pero interpreto que un invitado se registra como
    guest sin necesidad de pass y simplemente recibe un token para una especie de sesion temporal, haciendo que un user
    tenga que invitarle cada vez que quiera acceder a la plataforma */
    
    const {name, surnames, email, company } = matchedData(req);
    const guestUser = {
        name: name,
        surnames: surnames,
        email: email,
        company: company
    };
    guestUser.role = 'guest';

    if(await userModel.findOne({ email: email}) != null) {
        res.status(409).send("USER_EXISTS");
        return;
    } 

    const createdGuest = await userModel.create(guestUser);
    const selectedGuest = await userModel.findById(createdGuest._id).select('email status role _id');

    const token = await tokenSign(selectedGuest);
    res.status(200).send({ token: token, user: selectedGuest })
    
}

module.exports = { getUser, registerUser, validateUser, loginUser, updateUser, deleteUser, addUserLogo, addCompany, setRecoverCode, validatePassReset, changePassword, inviteGuest }