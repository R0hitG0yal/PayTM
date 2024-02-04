const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const userId = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId.id;
    req.accUserId = userId.userId;
    next();
  } catch (e) {
    res.status(403).send("Invalid token: " + token);
  }
});

module.exports = { authMiddleware };
