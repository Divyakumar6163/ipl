const express = require("express");
const livematchcontroller = require("../controllers/livematchcontroller");
const verifyToken = require("../middleware/verifytoken");
const router = express.Router();

router.get("/matches", livematchcontroller.getMatches);

router.post("/getscore", livematchcontroller.getScore);
router.post("/getrank", livematchcontroller.getRank);
router.post(
  "/matchplayer",
  verifyToken.checkRole(["admin", "updater"]),
  livematchcontroller.getPlayer
);
router.post("/getprize", livematchcontroller.getPrize);
router.post("/update-score", livematchcontroller.updateScore);
router.post("/update-rank", livematchcontroller.updateRank);
router.post("/track-run", livematchcontroller.trackRun);
router.post("/match-completed", livematchcontroller.matchCompletion);

module.exports = router;
