const { handleHttpError } = require("../utils/handleError");
const { verifyToken } = require("../utils/handleJwt");
const { userModel } = require("../models");

/* Codigo adaptado de la version que hicimos en clase */
const authMiddleware = async (req, res, next) => {
    try {
        /* Si la peticion va sin token tiramos un error */
        if (!req.headers.authorization) {
            handleHttpError(res, "NOT_TOKEN", 401);
            return;
        }
        
        /* Si el token no es valido o no tiene un id tambien tiramos un error */
        const token = req.headers.authorization.split(' ').pop();
        const dataToken = await verifyToken(token);
        
        if (!dataToken._id) {
            handleHttpError(res, "ERROR_ID_TOKEN", 401);
            return;
        }
        next();
    } catch (err) {
        handleHttpError(res, "NOT_SESSION", 401)
    }
}
module.exports = authMiddleware;