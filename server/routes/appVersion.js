const express = require("express");
const appVersionController = require("../controllers/appVersion");
const { route } = require("./teamsroutes");

const router = express.Router();

router
  .route("/version")
  .get(appVersionController.sendAppVersion)
  .post(appVersionController.createAppVersion);

module.exports = router;
