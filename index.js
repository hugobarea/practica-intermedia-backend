/* Dependencias */
const express = require('express');
const app = express();

/* Implementar variables de entorno */
require('dotenv').config();

/* Middlewares */

app.use(express.json()); // Para poder usar req.body

app.use("/api", require("./routes/index.js"));

app.get("/", (req, res) => {
    res.send("Corriendo");
})


app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})