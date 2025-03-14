const express = require("express");
const customercontroller = require("../controllers/customercontroller");
const router = express.Router();

router.post("/verifyPhone", customercontroller.verifyphone);
router.post("/addCustomer", customercontroller.addcustomer);

module.exports = router;
