/* Dependencias */
const express = require("express");
const router = express.Router();
const { registerUser, validateUser, loginUser } = require('../controllers/user.js');

router.post("/login", loginUser);
router.put("/validation", validateUser);
router.post("/register", registerUser);

module.exports = router;