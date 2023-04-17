const express = require("express");
const router = express.Router();
const { isAuth } = require("../../middlewares/isAuth");
const settingController = require("../../controllers/admin/setting");

router.get("/", settingController.settings);

router.post("/close", isAuth, settingController.closeSite);

router.put("/open", isAuth, settingController.openSite);

module.exports = router;
