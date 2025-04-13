const mongoose = require("mongoose");

/* Script de conexión a la base de datos (igual que el que hicimos en clase) */
const dbConnect = () => {
    const db_uri = process.env.NODE_ENV === 'test' ? process.env.DB_URI_TEST : process.env.DB_URI;
    console.log(db_uri);
    mongoose.set("strictQuery", false);
    try {
        mongoose.connect(db_uri);
    } catch(error) {
        console.error("Error conectando a la base de datos: ", error);
    }
    mongoose.connection.on("error", () => console.log("Error conectando a base de datos"));
    mongoose.connection.on("connected", () => console.log("Conectado a la base de datos"));
}

module.exports = dbConnect;