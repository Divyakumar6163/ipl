const express = require("express");
const {
  login,
  verifyToken,
  updatesold,
  getwallet,
  getRetailers,
} = require("../controllers/authcontroller");

const router = express.Router();

router.post("/login", login);
router.post("/getwallet", getwallet);
router.get("/getretailers", getRetailers);
router.post("/updatesold", updatesold);
router.post("/verifyToken", verifyToken);

module.exports = router;
