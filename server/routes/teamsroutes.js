const express = require("express");
const teamcontroller = require("../controllers/teamcontroller");
const router = express.Router();

router.post("/makeTeam", teamcontroller.createMatch);
router.get("/invoice/:filename", teamcontroller.getInvoice);
module.exports = router;
