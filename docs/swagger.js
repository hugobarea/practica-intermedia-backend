const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "API Bildy - Práctica Final Desarrollo Web",
            version: "0.1.0",
            description:
                "Práctica final de Programación Web II: Backend",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "Hugo Barea",
                email: "bareamorenohugo@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer"
                },
            },
            schemas: {
                user: {
                    type: "object",
                    required: ["name", "age", "email", "password"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Menganito"
                        },
                        age: {
                            type: "integer",
                            example: 20
                        },
                        email: {
                            type: "string",
                            example: "miemail@google.com"
                        },
                        password: {
                            type: "string"
                        },
                    },
                },
                userLoginRegister: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            example: "miemail@google.com"
                        },
                        password: {
                            type: "string"
                        },
                    }
                }
            },
        },
    },
    apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options)