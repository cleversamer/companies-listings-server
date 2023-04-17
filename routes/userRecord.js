const express = require("express");
const router = express.Router();
const recordsController = require("../controllers/record");
const { isClosed } = require("../middlewares/closeSite");
const { isAuth } = require("../middlewares/isAuth");

router.get("/getAll", isClosed, isAuth, recordsController.getUserRecords);

router.post("/get/pdf/:fileName", isClosed, isAuth, recordsController.getPDF);

router.post(
  "/share/pdf/:fileName",
  isClosed,
  isAuth,
  recordsController.sharePDF
);

module.exports = router;
