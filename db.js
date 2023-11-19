require("dotenv").config();

const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL;
const connectToMongo = async () => {
  try {
    const conn = await mongoose.connect(mongoURL);
    console.log(`Connected to DB: ${conn.connection.host}`);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectToMongo;
