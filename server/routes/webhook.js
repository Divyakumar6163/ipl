const express = require("express");
const webhookcontroller = require("../controllers/webhookcontroller");
const router = express.Router();
router.post("/webhook", webhookcontroller.webhook);
module.exports = router;
