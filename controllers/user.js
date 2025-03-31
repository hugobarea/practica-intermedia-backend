/* Dependencias */
const { userModel } = require('../models');
const { matchedData } = require("express-validator");
const { tokenSign, verifyToken } = require('../utils/handleJwt.js');
const { encrypt, compare } = require('../utils/handlePassword.js');
const { uploadToPinata } = require('../utils/handleUploadIPFS.js');
const handleHttpError = require('../utils/handleError.js');

require('dotenv').config();

const getUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);
        const user = await userModel.findById(dataToken._id).select("-password");
        res.status(200).send(user);
    } catch(err) {
        handleHttpError(res, "ERR_GET_USER", 500);
    }
}

const registerUser = async (req, res) => {
    try {
        const { email, password } = matchedData(req);
        
        /* Se crea el objeto user, los intentos y el estado se ponen por defecto */
        const user_db = {
            email: email,
            password: await encrypt(password),
            code: Math.floor(100000 + Math.random() * 899999).toString(),
        };

        /* Nos aseguramos de que no exista un usuario con el mismo mail */
        const existingUser = await userModel.findOne({ email });
        if(existingUser) {
            handleHttpError(res, "ALREADY_REGISTERED", 409);
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
    } catch(err) {
        handleHttpError(res, "ERR_REGISTER_USER", 500);
    }
}

const validateUser = async (req, res) => {
    try {
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
            handleHttpError(res, "INVALID_CODE", 400);
        }
    } catch(err) {
        handleHttpError(res, "ERR_VALIDATE_USER", 500);
    }
}

const loginUser = async (req, res) => {
    try {
        req = matchedData(req);
        const { email, password } = req;

        const user = await userModel.findOne({ email: email });

        if(user == null) {
            handleHttpError(res, "NOT_FOUND", 404);
            return;
        }

        if(user.status != 1) {
            handleHttpError(res, "NOT_VALIDATED", 401);
            return;
        }

        if(!await compare(password, user.password)) {
            handleHttpError(res, "INVALID_CREDENTIALS", 401);
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
                name: user.name
            }
        };

        res.status(200).send(data);
    } catch(err) {
        handleHttpError(res, "ERR_LOGIN_USER", 500);
    }
}

const updateUser = async (req, res) => {
    try {
        /* Sacamos el token JWT que ha pasado el usuario */
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);

        /* Sacamos los campos de la peticion, el email lo quito ya que con el token no haria falta */
        const { name, surnames, nif } = matchedData(req);

        /* Actualizamos el usuario con los datos nuevos y lo enviamos */
        const updatedUser = await userModel.findByIdAndUpdate(dataToken._id, 
            { name: name, surnames: surnames, nif: nif },
            { new: true }
        ).select("-password");

        res.status(200).send(updatedUser);
    } catch(err) {
        handleHttpError(res, "ERR_UPDATE_USER", 500);
    }
}

const deleteUser = async (req, res) => {
    try {
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
    } catch(err) {
        handleHttpError(res, "ERR_DELETE_USER", 500);
    }
}

const addUserLogo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);
        
        if(!req.file) {
            handleHttpError(res, "NO_FILE", 400);
            return;
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const pinataResponse = await uploadToPinata(fileBuffer, fileName);
        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`
        const data = await userModel.findByIdAndUpdate(dataToken._id, { logo: ipfs }, { new: true}).select("-password");
        res.status(200).send(data);
    } catch(err) {
        handleHttpError(res, "ERR_ADD_USER_LOGO", 500);
    }
}

const addCompany = async (req, res) => {
    try {
        const { company } = matchedData(req);
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);

        await userModel.findByIdAndUpdate(dataToken._id, { company: company }, { new: true});
        res.status(200).send("ACK");
    } catch(err) {
        handleHttpError(res, "ERR_ADD_COMPANY", 500);
    }
}

const setRecoverCode = async (req, res) => {
    try {
        const { email } = matchedData(req);
        const updatedUser = await userModel.findOneAndUpdate(
            {email: email},
            {reset_code: Math.floor(100000 + Math.random() * 899999).toString()},
            { new: true, select: 'email status role _id' }
        );

        if(updatedUser == null) {
            handleHttpError(res, "NOT_FOUND", 404);
            return;
        }
    
        res.status(200).send({ user: updatedUser });
    } catch(err) {
        handleHttpError(res, "ERR_SET_RECOVER_CODE", 500);
    }
}

const validatePassReset = async (req, res) => {
    try {
        const { email, code } = matchedData(req);
        const user = await userModel.findOne({ email: email });

        if(!user) {
            handleHttpError(res, "USER_NOT_FOUND", 404);
            return;
        }

        /* Verificar codigo con base de datos */
        if(code === user.reset_code) {
            await userModel.findOneAndUpdate(
                {email: email}, 
                { reset_code: null, reset_attempts:0 }
            );
            const token = await tokenSign(user);
            res.status(200).send({ token: token });
        } else {
            await userModel.findOneAndUpdate(
                {email: email}, 
                { $inc: { reset_attempts: 1 } }
            );
            handleHttpError(res, "INVALID_RESET_CODE", 400);
        }
    } catch(err) {
        handleHttpError(res, "ERR_VALIDATE_PASS_RESET", 500);
    }
}

const changePassword = async (req, res) => {
    try {
        /* Sacamos el id del token */
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);

        /* Y la pass del body */
        const { password } = matchedData(req);

        await userModel.findByIdAndUpdate(
            dataToken._id, 
            { password: await encrypt(password)}, 
            { new: true }
        );
        res.status(200).send("ACK");
    } catch(err) {
        handleHttpError(res, "ERR_CHANGE_PASSWORD", 500);
    }
}

const inviteGuest = async (req, res) => {
    try {
        const {name, surnames, email, company } = matchedData(req);
        const guestUser = {
            name: name,
            surnames: surnames,
            email: email,
            company: company,
            role: 'guest'
        };

        const existingUser = await userModel.findOne({ email });
        if(existingUser) {
            handleHttpError(res, "USER_EXISTS", 409);
            return;
        } 

        const createdGuest = await userModel.create(guestUser);
        const selectedGuest = await userModel.findById(createdGuest._id).select('email status role _id');

        const token = await tokenSign(selectedGuest);
        res.status(200).send({ token: token, user: selectedGuest });
    } catch(err) {
        handleHttpError(res, "ERR_INVITE_GUEST", 500);
    }
}

module.exports = { 
    getUser, 
    registerUser, 
    validateUser, 
    loginUser, 
    updateUser, 
    deleteUser, 
    addUserLogo, 
    addCompany, 
    setRecoverCode, 
    validatePassReset, 
    changePassword, 
    inviteGuest 
};