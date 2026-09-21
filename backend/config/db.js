const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_dms';
    await mongoose.connect(uri);
    console.log(`[MongoDB] Da ket noi: ${uri}`);
  } catch (err) {
    console.error('[MongoDB] Loi ket noi:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
