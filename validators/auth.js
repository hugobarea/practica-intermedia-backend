const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorPostRegister = [
    check("email").exists().isEmail(),
    check("password").exists().isLength({ min: 8 }),
    (req, res, next) => validateResults(req, res, next)
];

const validatorPutValidation = [
    check("code").exists().isLength({min: 6, max: 6}),
    (req, res, next) => validateResults(req, res, next)
];

const validatorPostValidation = [
    check("email").exists().isEmail(),
    check("code").exists().isLength({min: 6, max: 6}),
    (req, res, next) => validateResults(req, res, next)
];

const validatorPostRecover = [
    check("email").exists().isEmail(),
    (req, res, next) => validateResults(req, res, next)
];

const validatorPatchPassword = [
    check("password").exists().isLength({ min: 8 }),
    (req, res, next) => validateResults(req, res, next)
];

const validatorLogin = [
    check("email").exists().isEmail(),
    check("password").exists().notEmpty(),
    (req, res, next) => validateResults(req, res, next)
];
module.exports = { validatorPostRegister, validatorPutValidation, validatorPostValidation, validatorPostRecover, validatorPatchPassword, validatorLogin }