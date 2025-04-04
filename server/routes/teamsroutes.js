const express = require("express");
const teamcontroller = require("../controllers/teamcontroller");
const verifyToken = require("../middleware/verifytoken");

const router = express.Router();

router.post(
  "/makeTeam",
  verifyToken.checkRole(["admin", "retailer"]),
  teamcontroller.createMatch
);

router.post(
  "/makeTeamApp",
  verifyToken.checkRole(["admin", "retailer"]),
  teamcontroller.createMatchApp
);

router.get("/invoice/:filename", teamcontroller.getInvoice);
router.get("/getTeam/:teamID", teamcontroller.getPlayers);
module.exports = router;
