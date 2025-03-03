const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const teamroutes = require("./routes/teamsroutes");

const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(bodyParser.json());
app.use(express.json());

app.use("/", teamroutes);
module.exports = app;
