const express = require("express");
const router = express.Router();
const pendingUsersController = require("../../controllers/admin/pending");
const { isAuth } = require("../../middlewares/isAuth");

router.get("/getAll", isAuth, pendingUsersController.getPendings);

router.get("/get/:userId", isAuth, pendingUsersController.getPending);

router.put("/accept/:userId", isAuth, pendingUsersController.acceptUser);

router.put("/reject/:userId", isAuth, pendingUsersController.rejectUser);

module.exports = router;
