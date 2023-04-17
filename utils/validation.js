const { validationResult, body } = require("express-validator");

const signupValidateRules = [
  body("user_name").trim().notEmpty().withMessage("Username is required"),
  body("company_name")
    .trim()
    .notEmpty()
    .withMessage("company_name is required"),
  body("whats_app")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

const createUserValidateRules = [
  body("user_name").trim().notEmpty().withMessage("Username is required"),
  body("company_name")
    .trim()
    .notEmpty()
    .withMessage("company_name is required"),
  body("whats_app")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required"),
  body("countries").custom((value, { req }) => {
    if (value.length < 1) {
      throw Error("Countries Is Required");
    }
    return true;
  }),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

const editUserValidateRules = [
  body("user_name").trim().notEmpty().withMessage("Username is required"),
  body("company_name")
    .trim()
    .notEmpty()
    .withMessage("company_name is required"),
  body("whats_app")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required"),
  body("countries").custom((value, { req }) => {
    if (value.length < 1) {
      throw Error("Countries Is Required");
    }
    return true;
  }),
];

const editAdminValidateRules = [
  body("user_name").trim().notEmpty().withMessage("Username is required"),
  body("whats_app")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required"),
];

const signinValidateRules = [
  body("whats_app").trim().notEmpty().withMessage("whats app is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

const passwordValidateRules = [
  body("password").trim().notEmpty().withMessage("old password is required"),
  body("new_password")
    .trim()
    .notEmpty()
    .withMessage("new password is required"),
  body("confirm_password")
    .trim()
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("password not match");
      }
      return true;
    }),
];

const verifyValidateRules = [
  body("code").trim().notEmpty().withMessage("Code is required"),
];

const forgetPasswordValidateRules = [
  body("whats_app").trim().notEmpty().withMessage("whats_app is required"),
];

const resetPasswordValidateRules = [
  body("whats_app").trim().notEmpty().withMessage("whats_app is required"),
  body("code").trim().notEmpty().withMessage("Code is required"),
];

const countryValidateRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
];

const recordValidationRules = [
  body("rgn").trim().notEmpty().withMessage("Rgn cannot be empty"),
  body("owner").trim().notEmpty().withMessage("Owner cannot be empty"),
  body("comp").trim().notEmpty().withMessage("Comp cannot be empty"),
  body("phas").trim().notEmpty().withMessage("Phas cannot be empty"),
  body("type").trim().notEmpty().withMessage("Type cannot be empty"),
  body("bs").trim().notEmpty().withMessage("Bs cannot be empty"),
  body("fg").trim().notEmpty().withMessage("Fg cannot be empty"),
  body("bua_from").trim().notEmpty().withMessage("Bua_from cannot be empty"),
  body("bua_to").trim().notEmpty().withMessage("Bua_to cannot be empty"),
  body("ga_from").trim().notEmpty().withMessage("Ga_from cannot be empty"),
  body("ga_to").trim().notEmpty().withMessage("Ga_to cannot be empty"),
  body("ra_from").trim().notEmpty().withMessage("Ra_from cannot be empty"),
  body("ra_to").trim().notEmpty().withMessage("Ra_to cannot be empty"),
  body("utp_from").trim().notEmpty().withMessage("Utp_from cannot be empty"),
  body("utp_to").trim().notEmpty().withMessage("Utp_to cannot be empty"),
  body("dp_from").trim().notEmpty().withMessage("Dp_from cannot be empty"),
  body("dp_to").trim().notEmpty().withMessage("Dp_to cannot be empty"),
  body("ys_from").trim().notEmpty().withMessage("Ys_from cannot be empty"),
  body("ys_to").trim().notEmpty().withMessage("Ys_to cannot be empty"),
  body("dly_from").trim().notEmpty().withMessage("Dly_from cannot be empty"),
  body("dly_to").trim().notEmpty().withMessage("Dly_to cannot be empty"),
];

function validateInputs(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

module.exports = {
  signupValidateRules,
  signinValidateRules,
  createUserValidateRules,
  editUserValidateRules,
  editAdminValidateRules,
  passwordValidateRules,
  verifyValidateRules,
  forgetPasswordValidateRules,
  resetPasswordValidateRules,
  countryValidateRules,
  recordValidationRules,
  validateInputs,
};
