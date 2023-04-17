const express = require("express");
const router = express.Router();
const typesController = require("../../controllers/admin/type");
const { isAuth } = require("../../middlewares/isAuth");
const {
  countryValidateRules,
  validateInputs,
} = require("../../utils/validation");

// For Admin
router.get("/getAll", isAuth, typesController.getAllType);

router.get("/get/:id", isAuth, typesController.getOneType);

router.post(
  "/create",
  countryValidateRules,
  validateInputs,
  isAuth,
  typesController.createType
);

router.put(
  "/edit/:id",
  countryValidateRules,
  validateInputs,
  isAuth,
  typesController.editType
);

router.delete("/delete/:id", isAuth, typesController.deleteType);

module.exports = router;
