const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user");
const { isAuth } = require("../middlewares/isAuth");
const {
  validateInputs,
  passwordValidateRules,
} = require("../utils/validation");

router.put(
  "/updatePassword",
  passwordValidateRules,
  validateInputs,
  isAuth,
  usersController.updatePassword
);

module.exports = router;
