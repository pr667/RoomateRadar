// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB connection error: ${error.message}`);
    process.exit(1); // crash hard — never run without a DB
  }
};

module.exports = connectDB;
