const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enlighttechz';

async function connectDB() {
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('ENOTFOUND')) {
      console.error('Tip: your network may be blocking MongoDB SRV records. Try another DNS (e.g. 8.8.8.8) or the non-SRV connection string.');
    }
    return false;
  }
}

const isDBReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, isDBReady };
