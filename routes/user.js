/* Dependencias */
const express = require("express");
const router = express.Router();
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");
const { getUser, registerUser, validateUser, loginUser, updateUser, deleteUser, addUserLogo, addCompany, setRecoverCode, validatePassReset, changePassword, inviteGuest } = require('../controllers/user.js');

router.get("/", getUser);
router.delete("/", deleteUser);

router.post("/login", loginUser);

router.put("/validation", validateUser);

router.post("/register", registerUser);
router.put("/register", updateUser);

router.post("/recover", setRecoverCode); // Endpoint para solicitar reseteo de pass
router.post("/validation", validatePassReset); // Endpoint para validar codigo de reseteo y recibir token JWT
router.patch("/password", changePassword); // Endpoint para cambiar pass (teniendo token JWT)

router.patch("/logo", uploadMiddlewareMemory.single("logo"), addUserLogo);
router.patch("/company", addCompany);

router.post("/invite", inviteGuest);

module.exports = router;