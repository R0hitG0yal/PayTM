const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MongoDB_URL);
    console.log("Database connection successful");
  } catch (e) {
    console.log("Database connection failed");
  }
};

module.exports = dbConnect;