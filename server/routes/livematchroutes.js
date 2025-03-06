const express = require("express");
const livematchcontroller = require("../controllers/livematchcontroller");
const router = express.Router();

router.post("/getscore", livematchcontroller.getScore);
router.post("/getrank", livematchcontroller.getRank);
router.post("/matchplayer", livematchcontroller.getPlayer);
router.post("/update-score", livematchcontroller.updateScore);
router.post("/update-rank", livematchcontroller.updateRank);

module.exports = router;
