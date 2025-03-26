/* Dependencias */
const express = require("express");
const router = express.Router();
const { registerUser, validateUser, loginUser, updateUser } = require('../controllers/user.js');

router.post("/login", loginUser);
router.put("/validation", validateUser);
router.post("/register", registerUser);
router.put("/register", updateUser);

module.exports = router;