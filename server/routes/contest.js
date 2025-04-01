const express = require("express");
const contestcontroller = require("../controllers/contestcontroller");
const verifyToken = require("../middleware/verifytoken");
const router = express.Router();

// router.post(
//   "/verifyPhone",
//   verifyToken.checkRole(["admin", "retailer"]),
//   contestcontroller.verifyphone
// );
router.post("/getcontest", contestcontroller.getcontest);
router.post(
  "/savecontest",
  verifyToken.checkRole(["admin", "retailer"]),
  contestcontroller.makecontest
);
module.exports = router;
