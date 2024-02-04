const express = require("express");
const zod = require("zod");

const router = express.Router();

const Account = require("../models/bankModel");
const expressAsyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

router.get(
  "/balance",
  expressAsyncHandler(async function (req, res) {
    try {
      const findAccount = await Account.findOne({ userId: req.accUserId });
      res.status(200).json({ balance: findAccount.balance });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

const transferBody = zod.object({
  to: zod.string(),
  amount: zod.number(),
});

router.post(
  "/transfer",
  expressAsyncHandler(async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.accUserId }).session(
      session
    );

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    // Perform the transfer
    await Account.updateOne(
      { userId: req.accUserId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    res.json({
      message: "Transfer successful",
    });
  })
);

module.exports = router;
