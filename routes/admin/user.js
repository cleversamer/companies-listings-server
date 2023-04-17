const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/admin/user");
const { isAuth } = require("../../middlewares/isAuth");
const {
  createUserValidateRules,
  editUserValidateRules,
  validateInputs,
} = require("../../utils/validation");

router.get("/getAll", isAuth, usersController.getUsers);

router.get("/get/:userId", isAuth, usersController.getUser);

router.post(
  "/create",
  createUserValidateRules,
  validateInputs,
  isAuth,
  usersController.createUser
);

router.put(
  "/edit/:userId",
  editUserValidateRules,
  validateInputs,
  isAuth,
  usersController.upadteUser
);

router.put("/updateAdmin", isAuth, usersController.updateAdmin);

router.delete("/delete/:userId", isAuth, usersController.deleteUser);

module.exports = router;
