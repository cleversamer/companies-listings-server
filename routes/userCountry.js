const express = require("express");
const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
const countriesController = require("../controllers/userCountry");

router.get("/getAll", isAuth, countriesController.getUserCountry);

router.post("/create", isAuth, countriesController.createUserCountry);

module.exports = router;
