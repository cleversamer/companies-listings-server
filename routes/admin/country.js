const express = require("express");
const router = express.Router();
const countriesController = require("../../controllers/admin/country");
const { isAuth } = require("../../middlewares/isAuth");
const {
  countryValidateRules,
  validateInputs,
} = require("../../utils/validation");

// For Admin
router.get("/getAll", isAuth, countriesController.getCountries);

router.get("/get/:id", isAuth, countriesController.getCountry);

router.post(
  "/create",
  countryValidateRules,
  validateInputs,
  isAuth,
  countriesController.createCountry
);

router.put(
  "/edit/:id",
  countryValidateRules,
  validateInputs,
  isAuth,
  countriesController.editCountry
);

router.delete("/delete/:id", isAuth, countriesController.deleteCountry);

module.exports = router;
