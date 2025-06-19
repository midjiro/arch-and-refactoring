import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'http://localhost:27017', {
      dbName: 'cinema',
    });
    console.log('MongoDB connected');
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message ?? err);
    process.exit(1);
  }
};
