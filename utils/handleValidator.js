const { validationResult } = require("express-validator");

/* Funcion para validar y gestionar errores en caso de que los datos sean invalidos */
const validateResults = (req, res, next) => {
    try {
        validationResult(req).throw();
        return next();
    } catch(err) {
        res.status(422);
        res.send({ errors: err.array() });
    }
}

module.exports = validateResults;