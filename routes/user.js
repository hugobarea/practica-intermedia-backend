/* Dependencias */
const express = require("express");
const router = express.Router();
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");
const { getUser, registerUser, validateUser, loginUser, updateUser, deleteUser, addUserLogo } = require('../controllers/user.js');

router.get("/", getUser);
router.delete("/", deleteUser);

router.post("/login", loginUser);

router.put("/validation", validateUser);

router.post("/register", registerUser);
router.put("/register", updateUser);

router.patch("/logo", uploadMiddlewareMemory.single("logo"), addUserLogo);


module.exports = router;