const express = require("express");
const paymentcontroller = require("../controllers/paymentcontroller");
const router = express.Router();

router.post("/checkPayment", paymentcontroller.verifypayment);
router.post("/storePayment", paymentcontroller.addpaymentdetail);

module.exports = router;
