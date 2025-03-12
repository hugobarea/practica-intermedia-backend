const express = require("express");
const fs = require("fs");
const router = express.Router();

/* Elimina la extensión del nombre de un fichero */
const removeExtension = (fileName) => {
    return fileName.split('.').shift();
}

/* Para todas los archivos que no sean el index, hace un require de su router y lo monta */
fs.readdirSync(__dirname).filter((file) => {
    const name = removeExtension(file)
    if(name != 'index') {
        router.use('/' + name, require('./' + name));
    }
})

module.exports = router;