const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const cors = require("cors");
const authRoute = require("./routes/index");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
dbConnect();

app.use("/api/v1", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
