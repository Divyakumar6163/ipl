const express = require("express");
const customercontroller = require("../controllers/customercontroller");
const verifyToken = require("../middleware/verifytoken");
const router = express.Router();

router.post(
  "/verifyPhone",
  verifyToken.checkRole(["admin", "retailer"]),
  customercontroller.verifyphone
);
router.post("/addCustomer", customercontroller.addcustomer);

module.exports = router;
