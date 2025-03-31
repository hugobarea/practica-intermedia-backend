const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/session.js');
const { validatorPostRegister, validatorPutValidation, validatorPostValidation, validatorPostRecover, validatorPatchPassword, validatorLogin } = require('../validators/auth.js');
const { validatorPutRegister, validatorPatchCompany, validatorPostInvite } = require('../validators/onboarding.js');
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");
const { getUser, registerUser, validateUser, loginUser, updateUser, deleteUser, addUserLogo, addCompany, setRecoverCode, validatePassReset, changePassword, inviteGuest } = require('../controllers/user.js');

/* Endpoints de gestion de usuario */
router.get("/", authMiddleware, getUser);
router.delete("/", authMiddleware, deleteUser);

/* Endpoints de login/registro/validacion */
router.post("/login", validatorLogin, loginUser);
router.post("/register", validatorPostRegister, registerUser);
router.put("/register", authMiddleware, validatorPutRegister, updateUser);
router.put("/validation", authMiddleware, validatorPutValidation, validateUser);

/* Endpoints de cambio de pass */
router.post("/recover", validatorPostRecover, setRecoverCode); // Endpoint para solicitar reseteo de pass
router.post("/validation", validatorPostValidation, validatePassReset); // Endpoint para validar codigo de reseteo y recibir token JWT
router.patch("/password", authMiddleware, validatorPatchPassword, changePassword); // Endpoint para cambiar pass (teniendo token JWT)

/* Endpoints de funcionalidad dentro de la propia API */
router.patch("/logo", authMiddleware, uploadMiddlewareMemory.single("logo"), addUserLogo);
router.patch("/company", authMiddleware, validatorPatchCompany, addCompany);
router.post("/invite", validatorPostInvite, inviteGuest);

module.exports = router;