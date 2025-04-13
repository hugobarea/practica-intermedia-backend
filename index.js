/* Dependencias */
const express = require('express');
const app = express();
const dbConnect = require('./config/mongo.js');
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger.js");

/* Implementar variables de entorno */
require('dotenv').config();

/* Middlewares */

app.use(express.json()); // Para poder usar req.body


dbConnect();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api", require("./routes/index.js"));

app.get("/", (req, res) => {
    res.send("Corriendo");
})


const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
})

module.exports = { app, server };