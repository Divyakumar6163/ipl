const express = require("express");
const webhookcontroller = require("../controllers/webhookcontroller");
const router = express.Router();
router.post("/webhook", webhookcontroller.webhook);
router.get("/matchdetails/:teamID", webhookcontroller.matchdetails);

module.exports = router;
