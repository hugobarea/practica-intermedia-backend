/* Dependencias */
const express = require("express");
const router = express.Router();
const { getUser, registerUser, validateUser, loginUser, updateUser, deleteUser } = require('../controllers/user.js');

router.get("/", getUser);
router.post("/login", loginUser);
router.put("/validation", validateUser);
router.post("/register", registerUser);
router.put("/register", updateUser);
router.delete("/", deleteUser);

module.exports = router;