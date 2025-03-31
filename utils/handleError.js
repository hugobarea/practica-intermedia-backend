/* Funcion adaptada de clase para lanzar un error (por defecto un 403) con un mensaje */
const handleHttpError = (res, message, code = 403) =>{
    res.status(code).send(message)
}
module.exports = {handleHttpError}