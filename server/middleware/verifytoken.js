const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
dotenv.config({ path: "././config.env" });
const checkRole = (allowedRoles) => {
  console.log(allowedRoles);
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      console.log("Token", token);
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      console.log("JWT", process.env.ACCESS_JWT_SECRET);
      const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
      console.log("Decode", JSON.stringify(decoded));

      const user = await User.findById(decoded.id);

      console.log("Role", user);
      if (!allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Access Denied. Insufficient role" });
      }

      next(); // Proceed if role matches
    } catch (error) {
      res.status(501).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = { checkRole };
