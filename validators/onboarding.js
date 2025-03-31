const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorPutRegister = [
    /* Omito el mail (en la api de Ricardo viene) ya que realmente no hace falta */
    check("name").exists().notEmpty(),
    check("surnames").exists().notEmpty(),
    check("nif").exists().isLength({ min: 9, max: 9}),
    (req, res, next) => validateResults(req, res, next)
];

const validatorPatchCompany = [
    check("company").exists().notEmpty(),
    check("company.name").exists().notEmpty(),
    check("company.cif").exists().isLength(9),
    check("company.street").exists().notEmpty(),
    check("company.number").exists().isNumeric(),
    check("company.postal").exists().isNumeric(),
    check("company.city").exists().notEmpty(),
    check("company.province").exists().notEmpty(),
    (req, res, next) => validateResults(req, res, next)
];

const validatorPostInvite = [
    check("name").exists().notEmpty(),
    check("surnames").exists().notEmpty(),
    check("email").exists().isEmail(),
    check("company").exists().notEmpty(),
    check("company.name").exists().notEmpty(),
    check("company.cif").exists().isLength(9),
    check("company.street").exists().notEmpty(),
    check("company.number").exists().isNumeric(),
    check("company.postal").exists().isNumeric(),
    check("company.city").exists().notEmpty(),
    check("company.province").exists().notEmpty(),
    (req, res, next) => validateResults(req, res, next)
]
module.exports = { validatorPutRegister, validatorPatchCompany, validatorPostInvite }