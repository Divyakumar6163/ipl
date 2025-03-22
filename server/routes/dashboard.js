const express = require("express");
const verifyAdminToken = require("../middleware/verifytoken");
const dashboardcontroller = require("../controllers/dashboardcontroller");
const router = express.Router();
router.get(
  "/getretailers",
  verifyAdminToken.checkRole(["admin"]), // Pass roles as an array
  dashboardcontroller.getRetailers
);

router.post("/getsoldteam", dashboardcontroller.getsoldteam);
router.post("/getwinningteam", dashboardcontroller.getwinningteam);

module.exports = router;
