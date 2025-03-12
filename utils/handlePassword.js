const bcrypt = require("bcryptjs");

/* Funciones para cifrar y comparar hashes de Bcrypt tal y como vimos en clase */
const encrypt = async (clearPass) => {
    const hash = await bcrypt.hash(clearPass, 10);
    return hash;
}

const compare = async (clearPass, hashedPass) => {
    const result = await bcrypt.compare(clearPass, hashedPass);
    return result;
}

module.exports = { encrypt, compare };