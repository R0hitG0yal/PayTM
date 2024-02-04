const User = require("../models/userModel");
const Account = require("../models/bankModel");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const asyncHandler = require("express-async-handler");

const mySchema = zod.object({
  userName: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});
const loginSchema = zod.object({
  userName: zod.string().email(),
  password: zod.string(),
});

const createUser = asyncHandler(async (req, res) => {
  const { userName } = mySchema.parse(req.body);
  const findUser = await User.findOne({ userName: userName });
  if (!findUser) {
    try {
      const newUser = await User.create(req.body);
      const userId = newUser._id;
      const balance = await Account.create({
        userId: userId,
        balance: 1 + Math.random() * 10000,
      });
      const secret = process.env.JWT_SECRET;
      const token = await jwt.sign(
        {
          userId,
        },
        secret
      );
      res
        .status(200)
        .json({ message: "User created successfully", token: token });
    } catch (err) {
      throw new Error(err);
    }
  } else {
    res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { userName, password } = loginSchema.parse(req.body);
  const findUser = await User.findOne({ userName, password });
  if (!findUser) {
    res.status(411).json({
      message: "Error while logging in",
    });
  } else {
    const id = findUser._id;
    const secret = process.env.JWT_SECRET;
    const token = await jwt.sign(
      {
        id,
      },
      secret
    );
    res.status(200).json({ token: token });
  }
});

const updateBody = zod.object({
  password: zod.string().optional(true),
  firstName: zod.string().optional(true),
  lastName: zod.string().optional(true),
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.userId;
  try {
    const { success } = updateBody.safeParse(req.body);
    if (!success) throw new Error("Invalid info");
    const findUser = await User.findByIdAndUpdate(
      userId,
      {
        password: req?.body?.password,
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "Updated Successfully" });
  } catch (err) {
    res.status(411).json({ message: err.message });
  }
});

const getUsers = asyncHandler(async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = { createUser, loginUser, updateUser, getUsers };
