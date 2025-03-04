const express = require("express");
const { login, verifyToken } = require("../controllers/authcontroller");

const router = express.Router();

router.post("/login", login);
router.post("/verifyToken", verifyToken);

module.exports = router;
