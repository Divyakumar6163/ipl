const express = require("express");
const dashboardcontroller = require("../controllers/dashboardcontroller");
const router = express.Router();
router.get("/getretailers", dashboardcontroller.getRetailers);
router.post("/getsoldteam", dashboardcontroller.getsoldteam);
router.post("/getwinningteam", dashboardcontroller.getwinningteam);

module.exports = router;
