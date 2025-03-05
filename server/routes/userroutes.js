const express = require("express");
const {
  login,
  verifyToken,
  updatesold,
} = require("../controllers/authcontroller");

const router = express.Router();

router.post("/login", login);
router.post("/updatesold", updatesold);
router.post("/verifyToken", verifyToken);

module.exports = router;
