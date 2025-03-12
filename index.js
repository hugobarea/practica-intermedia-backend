/* Dependencias */
const express = require('express');

/* Implementar variables de entorno */
require('dotenv').config();

const app = express();

app.get("/", (req, res) => {
    res.send("Corriendo");
})

app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})