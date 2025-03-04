const express = require("express");
const livematchcontroller = require("../controllers/livematchcontroller");
const router = express.Router();

router.post("/getscore", livematchcontroller.getScore);
module.exports = router;
