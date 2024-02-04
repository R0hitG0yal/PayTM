const express = require("express");
const {
  createUser,
  loginUser,
  updateUser,
  getUsers,
} = require("../controller/userCtrl");
const { authMiddleware } = require("../middlewares/middleware");

const router = express.Router();

router.get("/bulk", getUsers);
router.post("/signup", createUser);
router.post("/login", loginUser);
router.put("/update", authMiddleware, updateUser);

module.exports = router;
