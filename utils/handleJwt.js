const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/* Funciones igual que las de clase para firmar y verificar un token JWT */
const tokenSign = (user) => {
    return jwt.sign({
        _id: user._id,
        role: user.role
    }
    , JWT_SECRET, {expiresIn: "2h"}) 
}

const verifyToken = (tokenJwt) => {
    try {
        return jwt.verify(tokenJwt, JWT_SECRET)
    } catch (err) {
        console.log(err)
    }
}

module.exports = { tokenSign, verifyToken };