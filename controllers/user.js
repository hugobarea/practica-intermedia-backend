
// Necesita email y password
const registerUser = (req, res) => {
    
    const { email, password } = req.body;
    
    res.status(201).send(email + " : " + password);
}

const loginUser = (req, res) => {
    res.send("Controlador implementado");
}

module.exports = { registerUser, loginUser }