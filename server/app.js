const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const teamroutes = require("./routes/teamsroutes");
const livematchroutes = require("./routes/livematchroutes");
const userroutes = require("./routes/userroutes");
const paymentroutes = require("./routes/payment");
const customerroutes = require("./routes/customer");
const webhookroutes = require("./routes/webhook");
const dashboardroutes = require("./routes/dashboard");
const contestroutes = require("./routes/contest");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://j92fkdxv-3000.inc1.devtunnels.ms",
  "https://ipl-livid.vercel.app",
  "https://ipl-backend-eight.vercel.app",
  "https://www.dhamaka.org.in",
];

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
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Match-ID",
      "Content-Disposition",
    ],
    exposedHeaders: ["Match-ID", "Content-Disposition"],
  })
);

app.options("*", cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use("/", teamroutes);
app.use("/", livematchroutes);
app.use("/", userroutes);
app.use("/", paymentroutes);
app.use("/", customerroutes);
app.use("/", webhookroutes);
app.use("/", dashboardroutes);
app.use("/", contestroutes);

module.exports = app;
