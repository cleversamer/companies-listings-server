const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { isAuth } = require("../middlewares/isAuth");
const limiter = require("../middlewares/limitCode");
const {
  signupValidateRules,
  signinValidateRules,
  forgetPasswordValidateRules,
  resetPasswordValidateRules,
  verifyValidateRules,
  validateInputs,
} = require("../utils/validation");

router.post(
  "/sign-up",
  signupValidateRules,
  validateInputs,
  authController.signUp
);

router.post(
  "/sign-in",
  signinValidateRules,
  validateInputs,
  authController.signIn
);

router.post(
  "/admin/sign",
  signinValidateRules,
  validateInputs,
  authController.adminSignIn
);

router.post(
  "/verify",
  verifyValidateRules,
  validateInputs,
  isAuth,
  authController.verifyCode
);

router.post("/refreshToken", authController.refreshToken);

router.post(
  "/forgetPassword",
  limiter,
  forgetPasswordValidateRules,
  validateInputs,
  authController.forgetPassword
);

router.post(
  "/resetPassword",
  resetPasswordValidateRules,
  validateInputs,
  authController.resetPassword
);

router.post("/verify/Resend", limiter, isAuth, authController.resendVerifyCode);

module.exports = router;
