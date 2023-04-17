const express = require("express");
const router = express.Router();
const recordsController = require("../../controllers/admin/record");
const deleteFiles = require("../../middlewares/deleteFiles");
const { isAuth } = require("../../middlewares/isAuth");
const upload = require("../../middlewares/multer");
const {
  recordValidationRules,
  validateInputs,
} = require("../../utils/validation");

router.get("/getAll", isAuth, recordsController.getRecords);

router.post(
  "/create",
  recordValidationRules,
  validateInputs,
  isAuth,
  recordsController.createRecord
);

router.put(
  "/edit/:recordId",
  recordValidationRules,
  validateInputs,
  isAuth,
  recordsController.editRecord
);

router.delete("/delete/:recordId", isAuth, recordsController.deleteRecord);

router.post(
  "/import/excel",
  isAuth,
  upload.single("file"),
  recordsController.importRecordExcel
);

router.post(
  "/import/pdf",
  isAuth,
  deleteFiles,
  upload.array("file"),
  recordsController.importRecordPDF
);

module.exports = router;
